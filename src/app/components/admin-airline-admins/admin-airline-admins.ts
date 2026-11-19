import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DOCUMENT_TYPES, DocumentType, GENDERS, Gender } from '../../flights/booking';
import { RegisterUserRequest, UserResponse } from '../../flights/auth';
import { Airline } from '../../flights/airline';
import { AirlineService } from '../../services/airline';
import { NotificationsService } from '../../services/notifications';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-admin-airline-admins',
  styleUrl: './admin-airline-admins.css',
  templateUrl: './admin-airline-admins.html',
})
export class AdminAirlineAdmins {

  private airlineService = inject(AirlineService);
  private announcement = inject(NotificationsService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder).nonNullable;

  documentTypes = DOCUMENT_TYPES;
  genders = GENDERS;

  // Today as "YYYY-MM-DD" in local time: the birth date must be before it
  today = new Date().toLocaleDateString('en-CA');

  // Airlines for the <select> (GET /api/airlines)
  airlines = toSignal(
    this.airlineService.getAirlines().pipe(
      catchError(() => {
        this.announcement.error('No pudimos cargar las aerolíneas.');
        return of([] as Airline[]);
      })
    ),
    { initialValue: [] as Airline[] }
  );

  isSaving = signal(false);
  // Last admin created and the name of its airline, to show it on the page
  created = signal<{ user: UserResponse; airlineName: string } | null>(null);

  // The same fields as the sellers page, plus the airline
  adminForm = this.fb.group({
    airlineId: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    // 8+ characters, at least one uppercase letter and one number
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
    documentType: ['CITIZENSHIP_ID' as DocumentType, Validators.required],
    idDocument: ['', Validators.required],
    firstName: ['', Validators.required],
    secondName: [''],
    lastName1: ['', Validators.required],
    lastName2: [''],
    birthDate: ['', Validators.required],
    gender: ['' as Gender | '', Validators.required],
  });

  onSubmit(): void {
    if (this.adminForm.invalid || this.isSaving()) {
      this.adminForm.markAllAsTouched();
      return;
    }

    const form = this.adminForm.getRawValue();
    // The airline does not go in the body: it goes in the URL
    const request: RegisterUserRequest = {
      email: form.email.trim(),
      password: form.password,                     // never trim a password
      idDocument: form.idDocument.trim(),
      documentType: form.documentType,
      firstName: form.firstName.trim(),
      secondName: form.secondName.trim() || null,
      lastName1: form.lastName1.trim(),
      lastName2: form.lastName2.trim() || null,
      birthDate: form.birthDate,
      gender: form.gender as Gender,
    };
    const airlineName = this.airlines().find((a) => a.id === form.airlineId)?.name ?? '';

    this.isSaving.set(true);
    this.airlineService.registerAirlineAdmin(form.airlineId, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.isSaving.set(false);
          this.created.set({ user, airlineName });
          this.announcement.success(`Administrador ${user.email} registrado.`);
          this.adminForm.reset();
        },
        error: (error) => {
          this.isSaving.set(false);
          this.handleError(error);
        },
      });
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 409) {
      this.announcement.error('Ya existe un usuario con ese email.');
    } else if (error.status === 404) {
      this.announcement.error('La aerolínea no existe. Recarga la página.');
    } else if (error.status === 400 || error.status === 422) {
      const fields = error.error?.errors ? Object.values(error.error.errors).join(' ') : '';
      this.announcement.error(`No se pudo registrar el administrador: ${fields || error.error?.message || ''}`);
    } else if (error.status === 403) {
      this.announcement.error('Solo el administrador de la plataforma puede registrar administradores de aerolínea.');
    } else {
      this.announcement.error('No se pudo registrar el administrador, intenta de nuevo.');
    }
  }
}