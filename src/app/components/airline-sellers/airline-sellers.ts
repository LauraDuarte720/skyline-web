import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { DOCUMENT_TYPES, DocumentType, GENDERS, Gender } from '../../flights/booking';
import { RegisterUserRequest, UserResponse } from '../../flights/auth';
import { AirlineService } from '../../services/airline';
import { NotificationsService } from '../../services/notifications';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-airline-sellers',
  styleUrl: './airline-sellers.css',
  templateUrl: './airline-sellers.html',
})
export class AirlineSellers {

  private airlineService = inject(AirlineService);
  private announcement = inject(NotificationsService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder).nonNullable;

  documentTypes = DOCUMENT_TYPES;
  genders = GENDERS;

  // Today as "YYYY-MM-DD" in local time: the birth date must be before it
  today = new Date().toLocaleDateString('en-CA');

  // ================= List: the sellers of the airline (GET /api/airlines/sellers) =================

  private reload = signal(0);   // +1 after creating one: asks the list again

  sellers = toSignal(
    toObservable(this.reload).pipe(
      switchMap(() =>
        this.airlineService.getSellers().pipe(
          catchError(() => {
            this.announcement.error('No pudimos cargar los vendedores.');
            return of([] as UserResponse[]);
          })
        )
      )
    ),
    { initialValue: [] as UserResponse[] }
  );

  // ================= Create =================

  isSaving = signal(false);
  created = signal<UserResponse | null>(null);   // last seller created, to show it on the page

  // Same rules as the backend (RegisterUserRequest + User.validatePasswordStrength)
  sellerForm = this.fb.group({
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
    if (this.sellerForm.invalid || this.isSaving()) {
      this.sellerForm.markAllAsTouched();
      return;
    }

    const form = this.sellerForm.getRawValue();
    const request: RegisterUserRequest = {
      email: form.email.trim(),
      password: form.password,                     // never trim a password
      idDocument: form.idDocument.trim(),
      documentType: form.documentType,
      firstName: form.firstName.trim(),
      secondName: form.secondName.trim() || null,  // empty optional field: null, like in passengers
      lastName1: form.lastName1.trim(),
      lastName2: form.lastName2.trim() || null,
      birthDate: form.birthDate,
      gender: form.gender as Gender,               // the validator already checked it is not ''
    };

    this.isSaving.set(true);
    this.airlineService.registerSeller(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.isSaving.set(false);
          this.created.set(user);
          this.announcement.success(`Vendedor ${user.email} registrado.`);
          this.sellerForm.reset();
          this.reload.update(r => r + 1);
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
    } else if (error.status === 400 || error.status === 422) {
      // 400 brings a map field -> message; 422 brings one message (weak password, ...)
      const fields = error.error?.errors ? Object.values(error.error.errors).join(' ') : '';
      this.announcement.error(`No se pudo registrar el vendedor: ${fields || error.error?.message || ''}`);
    } else if (error.status === 403) {
      this.announcement.error('Solo el administrador de la aerolínea puede registrar vendedores.');
    } else {
      this.announcement.error('No se pudo registrar el vendedor, intenta de nuevo.');
    }
  }
}