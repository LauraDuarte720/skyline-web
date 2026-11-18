import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Passengers } from '../components/passengers/passengers';
import { BookingFlowService } from '../services/booking-flow';
import { BookingService } from '../services/booking';
import { NotificationsService } from '../services/notifications';

// Leaving the passengers page without finishing: ask, and if the user agrees, cancel the booking
export const leaveBookingGuard: CanDeactivateFn<Passengers> = (component) => {
  const bookingFlow = inject(BookingFlowService);
  const bookingService = inject(BookingService);
  const announcement = inject(NotificationsService);

  const bookingId = bookingFlow.bookingId();

  // Passengers saved (normal next step) or there is no booking: let the user go
  if (component.passengersSaved() || !bookingId) {
    return true;
  }

  // The user changed their mind: stay on the page
  if (!confirm('¿Seguro que quieres salir? Se cancelará tu reserva.')) {
    return false;
  }

  // Cancel in the backend (frees the seats) and empty the booking flow
  return bookingService.cancel(bookingId).pipe(
    map(() => {
      bookingFlow.clear();
      announcement.info('Tu reserva fue cancelada.');
      return true;
    }),
    catchError(() => {
      // Could not cancel (e.g. no connection): the backend expires it by itself
      bookingFlow.clear();
      announcement.error('No pudimos cancelar la reserva; se vencerá sola en unos minutos.');
      return of(true);
    })
  );
};