import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { DOCUMENT_TYPES, DocumentType, GENDERS, Gender } from '../../flights/booking';
import { RegisterUserRequest } from '../../flights/auth';
import { AuthService } from '../../services/auth';
import { NotificationsService } from '../../services/notifications';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {

  private authService = inject(AuthService);
  private announcement = inject(NotificationsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder).nonNullable;

  documentTypes = DOCUMENT_TYPES;
  genders = GENDERS;

  // Today as "YYYY-MM-DD" in local time: the birth date must be before it
  today = new Date().toLocaleDateString('en-CA');

  isSaving = signal(false);

  // The same fields as the sellers page (the backend uses the same RegisterUserRequest)
  registerForm = this.fb.group({
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
    if (this.registerForm.invalid || this.isSaving()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const form = this.registerForm.getRawValue();
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

    this.isSaving.set(true);
    // 1. Register the user. 2. With the same email and password, log in,
    // so the customer does not have to type them again.
    this.authService.register(request)
      .pipe(
        switchMap(() => this.authService.login({ username: request.email, password: request.password })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.authService.saveSession(response);
          this.announcement.success('¡Bienvenido a Skyline! Tu cuenta quedó creada.');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isSaving.set(false);
          this.handleError(error);
        },
      });
  }

  private handleError(error: HttpErrorResponse): void {
    // The URL tells us which of the two calls failed
    if (error.url?.endsWith('/login')) {
      // The account was created, only the automatic login failed
      this.announcement.success('Tu cuenta quedó creada, ahora inicia sesión.');
      this.router.navigate(['/login']);
    } else if (error.status === 409) {
      this.announcement.error('Ya existe una cuenta con ese email.');
    } else if (error.status === 400 || error.status === 422) {
      const fields = error.error?.errors ? Object.values(error.error.errors).join(' ') : '';
      this.announcement.error(`No se pudo crear la cuenta: ${fields || error.error?.message || ''}`);
    } else {
      this.announcement.error('No se pudo crear la cuenta, intenta de nuevo.');
    }
  }
}