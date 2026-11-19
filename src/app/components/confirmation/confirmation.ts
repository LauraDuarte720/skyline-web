import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingDetail } from '../../flights/booking';
import { BookingService } from '../../services/booking';
import { BookingFlowService } from '../../services/booking-flow';
import { NotificationsService } from '../../services/notifications';

// Last page of the booking flow: shown after the payment is approved.
// It has no leave guard: the booking is finished, there is nothing to cancel.
@Component({
  selector: 'app-confirmation',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css',
})
export class Confirmation {

  private bookingService = inject(BookingService);
  private bookingFlow = inject(BookingFlowService);
  private announcement = inject(NotificationsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Copied now, because the flow is cleared once the booking is loaded
  outboundFlight = this.bookingFlow.outboundFlight();
  returnFlight = this.bookingFlow.returnFlight();

  isLoading = signal(true);
  booking = signal<BookingDetail | null>(null);

  // The attempt that paid the booking (the others were declined or failed)
  approvedPayment = computed(() => this.booking()?.payments.find((payment) => payment.status === 'APPROVED') ?? null);

  holder = computed(() => this.booking()?.passengers.find((passenger) => passenger.holder) ?? null);

  constructor() {
    const bookingId = this.bookingFlow.bookingId();
    if (!bookingId) {
      // E.g. a reload after the flow was cleared: the booking was already shown
      this.router.navigate(['/']);
      return;
    }

    this.bookingService.getBooking(bookingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (booking) => {
          if (booking.bookingStatus !== 'CONFIRMED') {
            this.router.navigate(['/payment']);   // not paid yet: back to pay
            return;
          }
          this.booking.set(booking);
          this.isLoading.set(false);
          // The booking is finished: going back finds no booking, so no step can pay or change it again
          this.bookingFlow.clear();
        },
        error: () => {
          this.isLoading.set(false);
          this.announcement.error('No se pudo cargar tu reserva');
        },
      });
  }
}
