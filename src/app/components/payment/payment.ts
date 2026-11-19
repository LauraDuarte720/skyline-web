import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { BookingDetail, PassengerDetailResponse } from '../../flights/booking';
import { BookingService } from '../../services/booking';
import { BookingFlowService } from '../../services/booking-flow';
import { NotificationsService } from '../../services/notifications';
import { BookingStep } from '../../guards/leave-booking-guard';

// The fake provider of the backend approves every token except these two.
// The card never leaves the front: only the token is sent.
function tokenFor(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, '');
  if (digits.endsWith('0002')) return 'tok_declined';   // "Insufficient funds"
  if (digits.endsWith('0119')) return 'tok_error';      // "Payment provider unavailable"
  return `tok_${digits.slice(-4)}`;                     // any other: approved
}

// "MM/YY" must be this month or later (the pattern validator reports the format)
function notExpired(control: AbstractControl): ValidationErrors | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(control.value ?? '');
  if (!match) return null;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const valid = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
  return valid ? null : { expired: true };
}

// LocalDateTime can arrive with nanoseconds ("...:33.534556900"): keep "YYYY-MM-DDTHH:mm:ss",
// which the browser reads as local time (the same zone as the backend)
function parseLocalDateTime(value: string): number {
  return new Date(value.slice(0, 19)).getTime();
}

// 5 → "05", for the countdown
const pad = (n: number) => String(n).padStart(2, '0');

@Component({
  selector: 'app-payment',
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})


export class Payment implements BookingStep {

  private bookingService = inject(BookingService);
  private announcement = inject(NotificationsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  protected bookingFlow = inject(BookingFlowService);   // protected: the HTML shows the flights

  // ---------- Page state ----------
  stepCompleted = signal(false);              // true after the payment is approved: the guard lets the user go
  isLoading = signal(true);                   // true while the booking loads
  paying = signal(false);                     // true while the POST runs: no double payment
  errorMessage = signal<string | null>(null); // why the last attempt failed
  booking = signal<BookingDetail | null>(null);

  // ---------- Countdown to paymentDeadline ----------
  private now = signal(Date.now());           // updated every second (part 3)

  secondsLeft = computed(() => {
    const deadline = this.booking()?.paymentDeadline;
    if (!deadline) return null;               // booking not loaded yet
    return Math.max(0, Math.floor((parseLocalDateTime(deadline) - this.now()) / 1000));
  });

  expired = computed(() => this.secondsLeft() === 0);

  countdown = computed(() => {
    const seconds = this.secondsLeft() ?? 0;
    return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;   // "12:05"
  });

  // ---------- Card form ----------
  cardForm = inject(FormBuilder).nonNullable.group({
    number: ['', [Validators.required, Validators.pattern(/^(\d{4} ?){3}\d{4}$/)]],   // 16 digits, spaces allowed
    name: ['', [Validators.required, Validators.minLength(3)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/), notExpired]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  // ---------- Used by the HTML ----------
  // Red border only after the user touched the field, not as soon as the page opens
  invalid(field: keyof typeof this.cardForm.controls): boolean {
    const control = this.cardForm.controls[field];
    return control.invalid && control.touched;
  }

  // "3A, 5C" or "Sin asiento"
  seatCodes(passenger: PassengerDetailResponse): string {
    return passenger.seats.map((seat) => seat.seatCode).join(', ') || 'Sin asiento';
  }

    constructor() {
    const bookingId = this.bookingFlow.bookingId();
    if (!bookingId) {
      this.router.navigate(['/catalogue']);   // opened /payment without a booking
      return;
    }

    // ---------- Load the booking ----------
    this.bookingService.getBooking(bookingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (booking) => {
          if (booking.bookingStatus === 'CONFIRMED') {
            // Already paid (e.g. in another tab): show the confirmation
            this.stepCompleted.set(true);
            this.router.navigate(['/confirmation']);
            return;
          }
          if (booking.bookingStatus !== 'PENDING') {
            // CANCELLED or EXPIRED: it can no longer be paid
            this.leave('Tu reserva ya no está activa. Busca tu vuelo de nuevo.');
            return;
          }
          this.booking.set(booking);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.announcement.error('No se pudo cargar la reserva');
        },
      });

    // ---------- Tick every second ----------
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))   // stops when the user leaves the page
      .subscribe(() => {
        this.now.set(Date.now());
        if (this.expired()) {
          this.leave('Se acabó el tiempo para pagar y tu reserva venció.');
        }
      });
  }

  // ---------- POST /api/bookings/{id}/payment ----------
  pay(): void {
    const bookingId = this.bookingFlow.bookingId();
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();   // show the red borders of every wrong field
      return;
    }
    if (!bookingId || this.paying() || this.expired()) return;

    this.paying.set(true);
    this.errorMessage.set(null);
    const paymentToken = tokenFor(this.cardForm.controls.number.value);

    this.bookingService.pay(bookingId, { paymentToken }).subscribe({
      next: () => {
        // paying stays true: the button stays disabled while the page changes
        this.announcement.success('El pago fue aprobado. ¡Gracias por tu compra!');
        this.stepCompleted.set(true);   // before navigate, the guard checks it
        this.router.navigate(['/confirmation']);
      },
      error: (error: HttpErrorResponse) => {
        this.paying.set(false);
        // 422: declined, provider error or deadline passed. The booking stays PENDING: the user can try again
        this.errorMessage.set(error.status === 422
          ? error.error?.message ?? 'El pago no fue aprobado'
          : 'No pudimos procesar el pago, intenta de nuevo');
      },
    });
  }

  // The booking can no longer be paid: empty the flow (then the guard lets the user go) and go back
  private leave(message: string): void {
    if (!this.bookingFlow.bookingId()) return;   // already left: the interval may tick once more
    this.bookingFlow.clear();
    this.announcement.error(message);
    this.router.navigate(['/catalogue']);
  }
}