import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AddPassengersRequest, DocumentType, Gender, PHONE_PREFIXES, PhonePrefix } from '../../flights/booking';
import { BookingFlowService } from '../../services/booking-flow';
import { NotificationsService } from '../../services/notifications';
import { BookingService } from '../../services/booking';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-passengers',
  styleUrl: './passengers.css',
  templateUrl: './passengers.html',
})
export class Passengers {

  private bookingService = inject(BookingService);
  private announcement = inject(NotificationsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder).nonNullable;
  protected bookingFlow = inject(BookingFlowService);   // protected: the HTML uses it

  isLoading = signal(false);
  passengersSaved = signal(false);

  // Options for the <select>s: value = what the backend expects, label = what the user sees
  documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'CITIZENSHIP_ID', label: 'Cédula de ciudadanía' },
    { value: 'FOREIGNER_ID', label: 'Cédula de extranjería' },
    { value: 'PASSPORT', label: 'Pasaporte' },
    { value: 'IDENTITY_CARD', label: 'Tarjeta de identidad' },
    { value: 'CIVIL_REGISTRATION', label: 'Registro civil' },
  ];
  genders: { value: Gender; label: string }[] = [
    { value: 'FEMALE', label: 'Femenino' },
    { value: 'MALE', label: 'Masculino' },
    { value: 'OTHER', label: 'Otro' },
  ];
  phonePrefixes = PHONE_PREFIXES;

  // Today as "YYYY-MM-DD" in local time: the birth date cannot be after it
  today = new Date().toLocaleDateString('en-CA');

  form = this.fb.group({
    // One form per passenger: as many as passengers were searched in the catalogue
    passengers: this.fb.array(
      Array.from({ length: this.bookingFlow.passengers() ?? 0 }, () => this.createPassengerForm())
    ),
    holderIndex: [0],   // position of the holder in the passengers list
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
    phonePrefix: ['COLOMBIA' as PhonePrefix, [Validators.required]],
  });

  // The passenger forms, to loop over them in the HTML
  get passengerForms() {
    return this.form.controls.passengers.controls;
  }

  constructor() {
    // Opened /passengers without a booking: go back to the catalogue
    if (!this.bookingFlow.bookingId()) {
      this.router.navigate(['/catalogue']);
    }
  }

  // The form of ONE passenger (it was your passengerRequestform)
  private createPassengerForm() {
    return this.fb.group({
      idDocument: ['', [Validators.required]],
      documentType: ['CITIZENSHIP_ID' as DocumentType, [Validators.required]],
      firstName: ['', [Validators.required]],
      secondName: [''],
      lastName1: ['', [Validators.required]],
      lastName2: [''],
      birthDate: ['', [Validators.required]],
      gender: ['' as Gender | '', [Validators.required]],   // '' until the user chooses one
    });
  }

  onSubmit(): void {
    const bookingId = this.bookingFlow.bookingId();
    if (!bookingId) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();   // shows the error messages of every empty field
      return;
    }

    const value = this.form.getRawValue();
    const holder = value.passengers[value.holderIndex];

    // The backend also checks it, but this way the user knows before sending
    if (this.age(holder.birthDate) < 18) {
      this.announcement.error('El titular de la reserva debe ser mayor de edad.');
      return;
    }

    const request: AddPassengersRequest = {
      passengers: value.passengers.map((passenger) => ({
        idDocument: passenger.idDocument.trim(),
        documentType: passenger.documentType,
        firstName: passenger.firstName.trim(),
        secondName: passenger.secondName.trim() || null,   // empty -> null (the backend rejects "")
        lastName1: passenger.lastName1.trim(),
        lastName2: passenger.lastName2.trim() || null,
        birthDate: passenger.birthDate,
        gender: passenger.gender as Gender,                 // the required validator ensures it is not ''
      })),
      holderIdDocument: holder.idDocument.trim(),
      email: value.email.trim(),
      phoneNumber: value.phoneNumber.trim(),
      phonePrefix: value.phonePrefix,
    };

    this.isLoading.set(true);
    this.bookingService.addPassengers(bookingId, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.passengersSaved.set(true); 
          this.announcement.success('Pasajeros registrados correctamente.');
          this.router.navigate(['/seat-selector']);   // next step of the booking
        },
        error: (error) => this.handleError(error),
      });
  }

  // Full years between the birth date and today
  private age(birthDate: string): number {
    const birth = new Date(birthDate);   // "YYYY-MM-DD" is read as UTC, so use the UTC getters
    const today = new Date();
    const years = today.getFullYear() - birth.getUTCFullYear();
    const hadBirthday =
      today.getMonth() > birth.getUTCMonth() ||
      (today.getMonth() === birth.getUTCMonth() && today.getDate() >= birth.getUTCDate());
    return hadBirthday ? years : years - 1;
  }

  private handleError(error: HttpErrorResponse): void {
    this.isLoading.set(false);
    if (error.status === 404) {
      this.announcement.error('La reserva no existe. Busca los vuelos de nuevo.');
      this.bookingFlow.clear();
      this.router.navigate(['/catalogue']);
    } else if (error.status === 400 || error.status === 422) {
      // A rule failed (repeated document, booking expired...): the backend explains which one
      this.announcement.error(`No se pudieron registrar los pasajeros: ${error.error?.message ?? ''}`);
    } else {
      this.announcement.error('No se pudieron registrar los pasajeros, intenta de nuevo.');
    }
  }
}