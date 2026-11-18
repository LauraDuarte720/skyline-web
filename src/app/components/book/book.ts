import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BookingService } from '../../services/booking';
import { BookingFlowService } from '../../services/booking-flow';
import { NotificationsService } from '../../services/notifications';
import { SelectOutboundFlightRequest, SelectReturnFlightRequest } from '../../flights/booking';

@Component({
  imports: [DatePipe, DecimalPipe, RouterLink],
  selector: 'app-book',
  styleUrl: './book.css',
  templateUrl: './book.html',
})
export class Book {

  private bookingService = inject(BookingService);
  private announcement = inject(NotificationsService);
  private router = inject(Router);
  protected bookingFlow = inject(BookingFlowService);   // protected: the HTML uses it

  isLoading = signal(false);

  constructor() {
    // Opened /book without choosing flights: go back to the catalogue
    if (!this.bookingFlow.flightsChosen()) {
      this.router.navigate(['/catalogue']);
    }
  }

  onConfirm(): void {
    const outbound = this.bookingFlow.outboundFlight();
    const tripType = this.bookingFlow.tripType();
    const passengers = this.bookingFlow.passengers();
    // Missing data, or the booking already exists (double click, F5): do nothing
    if (!outbound || !tripType || !passengers || this.bookingFlow.bookingId()) return;

    const request: SelectOutboundFlightRequest = {
    outboundFlightId: outbound.id,
    numPassengers: passengers,
    tripType,
    };

    this.isLoading.set(true);
    this.bookingService.create(request).subscribe({
        next: (booking) => {
          this.bookingFlow.setBookingId(booking.id);   // save it right away
          const returnFlight = this.bookingFlow.returnFlight();
          if (returnFlight) {
            this.addReturnFlight(booking.id, returnFlight.id);
          } else {
            this.finish();
          }
        },
        error: (error) => this.handleError(error),
      });
  }

  private addReturnFlight(bookingId: string, returnFlightId: string): void {
    const request: SelectReturnFlightRequest = { returnFlightId };
    this.bookingService.selectReturnFlight(bookingId, request).subscribe({
      next: () => this.finish(),
      error: (error) => {
        // The outbound seats are already held: cancel the booking to give them back
        this.bookingService.cancel(bookingId).subscribe();
        this.handleError(error);
      },
    });
  }

  private finish(): void {
    this.isLoading.set(false);
    this.announcement.success('¡Vuelos seleccionados con éxito! Tienes 20 minutos para completar tu reserva.');
    this.router.navigate(['/passengers']);
  }

  private handleError(error: HttpErrorResponse): void {
    this.isLoading.set(false);
    if (error.status === 404) {
      // The flight no longer exists in the backend's search cache (e.g. the server restarted)
      this.announcement.error('Tu búsqueda expiró. Busca los vuelos de nuevo.');
    } else if (error.status === 422) {
      // A business rule failed (e.g. no seats left); the backend explains which one
      this.announcement.error(`No se pudo crear la reserva: ${error.error?.message ?? ''}`);
    } else {
      this.announcement.error('No se pudo crear la reserva, intenta de nuevo.');
      return;   // network error: keep the data so the user can try again
    }
    this.bookingFlow.clear();
    this.router.navigate(['/catalogue']);
  }
}