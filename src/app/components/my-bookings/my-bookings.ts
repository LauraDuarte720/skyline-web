import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { BOOKING_STATUSES, BookingResponse, BookingStatus } from '../../flights/booking';
import { BookingService } from '../../services/booking';
import { NotificationsService } from '../../services/notifications';

@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-my-bookings',
  styleUrl: './my-bookings.css',
  templateUrl: './my-bookings.html',
})
export class MyBookings {

  private bookingService = inject(BookingService);
  private announcement = inject(NotificationsService);
  private destroyRef = inject(DestroyRef);

  private reload = signal(0);   // +1 after cancelling: asks the list again

  // GET /api/bookings/mine. null = still loading
  bookings = toSignal<BookingResponse[] | null>(
    toObservable(this.reload).pipe(
      switchMap(() => this.bookingService.getMine().pipe(
        catchError(() => {
          this.announcement.error('No pudimos cargar tus reservas.');
          return of([] as BookingResponse[]);
        })
      ))
    ),
    { initialValue: null }
  );

  cancellingId = signal<string | null>(null);   // booking whose cancel is running

  // Label and badge color of a status (the backend sends it as text)
  status(booking: BookingResponse) {
    return BOOKING_STATUSES[booking.bookingStatus as BookingStatus]
      ?? { label: booking.bookingStatus, color: 'secondary' };
  }

  tripTypeLabel(booking: BookingResponse): string {
    return booking.tripType === 'ROUND_TRIP' ? 'Ida y regreso' : 'Solo ida';
  }

  // The passenger who holds the booking (the contact person)
  holder(booking: BookingResponse) {
    return booking.passengers.find((passenger) => passenger.holder) ?? null;
  }

  // The payment that paid it, only in a confirmed booking
  approvedPayment(booking: BookingResponse) {
    return booking.payments.find((payment) => payment.status === 'APPROVED') ?? null;
  }

  // Only a pending booking can be cancelled (backend rule)
  cancel(booking: BookingResponse): void {
    if (this.cancellingId() !== null) return;
    if (!confirm('¿Cancelar esta reserva? Los asientos se liberan y no se puede deshacer.')) return;

    this.cancellingId.set(booking.id);
    this.bookingService.cancel(booking.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cancellingId.set(null);
          this.announcement.success('Reserva cancelada.');
          this.reload.update((value) => value + 1);
        },
        error: (error: HttpErrorResponse) => {
          this.cancellingId.set(null);
          if (error.status === 422 || error.status === 409) {
            // E.g. it was paid or expired meanwhile: show the real status
            this.announcement.error('Esta reserva ya no se puede cancelar.');
            this.reload.update((value) => value + 1);
          } else {
            this.announcement.error('No se pudo cancelar la reserva, intenta de nuevo.');
          }
        },
      });
  }
}