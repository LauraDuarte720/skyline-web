import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { PassengerDetailResponse } from '../../flights/booking';
import { BookingService } from '../../services/booking';
import { AirlineService } from '../../services/airline';
import { BookingFlowService } from '../../services/booking-flow';
import { NotificationsService } from '../../services/notifications';
import { BookingStep } from '../../guards/leave-booking-guard';

@Component({
  imports: [DecimalPipe],
  selector: 'app-luggage',
  styleUrl: './luggage.css',
  templateUrl: './luggage.html',
})
export class Luggage implements BookingStep {

  private bookingService = inject(BookingService);
  private airlineService = inject(AirlineService);
  private announcement = inject(NotificationsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  protected bookingFlow = inject(BookingFlowService);   // protected: the HTML uses it

  isLoading = signal(true);                              // true while the booking and the airline are loading
  savingPassengerId = signal<string | null>(null);       // passenger whose PUT is running (null = none)
  stepCompleted = signal(false);                         // true when leaving with "Continuar": the guard lets the user go

  passengers = signal<PassengerDetailResponse[]>([]);
  maxLuggage = signal<number | null>(null);              // max pieces per passenger (from the airline)
  bookingPrice = signal<number | null>(null);            // total of the booking, updated after every PUT

  // Price of one piece: every passenger flies the same legs, so it is the same for all.
  // The backend calculates it, so it is known after the first piece is added.
  pricePerBag = computed(() => {
    const luggage = this.passengers().find((passenger) => this.quantityOf(passenger) > 0)?.luggage;
    return luggage ? luggage.subTotal / luggage.quantity : null;
  });

  constructor() {
    const bookingId = this.bookingFlow.bookingId();
    const airlineId = this.bookingFlow.outboundFlight()?.airlineId;

    // Opened /luggage without a booking: go back to the catalogue
    if (!bookingId || !airlineId) {
      this.router.navigate(['/catalogue']);
      return;
    }

    forkJoin({
      booking: this.bookingService.getBooking(bookingId),
      // The limit is only a help (the backend checks it too): if the airline fails, go on without it
      airline: this.airlineService.getById(airlineId).pipe(catchError(() => of(null))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ booking, airline }) => {
          this.maxLuggage.set(airline?.maximumLuggageAmount ?? null);
          this.bookingPrice.set(booking.price);
          this.passengers.set(booking.passengers);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.handleError(error);
        },
      });
  }

  // ---------- Used by the HTML ----------
  quantityOf(passenger: PassengerDetailResponse): number {
    return passenger.luggage?.quantity ?? 0;
  }

  // One PUT at a time (each one changes the booking price) and not above the airline limit
  canAdd(passenger: PassengerDetailResponse): boolean {
    const max = this.maxLuggage();
    return this.savingPassengerId() === null && (max === null || this.quantityOf(passenger) < max);
  }

  // The backend cannot remove luggage (quantity must be > 0): the minimum is 1
  canRemove(passenger: PassengerDetailResponse): boolean {
    return this.savingPassengerId() === null && this.quantityOf(passenger) > 1;
  }

  add(passenger: PassengerDetailResponse): void {
    if (this.canAdd(passenger)) {
      this.save(passenger, this.quantityOf(passenger) + 1);
    }
  }

  remove(passenger: PassengerDetailResponse): void {
    if (this.canRemove(passenger)) {
      this.save(passenger, this.quantityOf(passenger) - 1);
    }
  }

  onContinue(): void {
    this.stepCompleted.set(true);   // must be before navigate, the guard checks it
    // TODO: change to the next step (extra services / payment) when that page exists
    this.router.navigate(['/']);
  }

  // ---------- PUT /api/bookings/{id}/luggage ----------
  private save(passenger: PassengerDetailResponse, quantity: number): void {
    const bookingId = this.bookingFlow.bookingId();
    if (!bookingId) return;

    this.savingPassengerId.set(passenger.idDocument);
    this.bookingService.addLuggage(bookingId, { passengerId: passenger.idDocument, quantity })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (booking) => {
          this.savingPassengerId.set(null);
          // The answer has the new total and the new luggage of the passenger
          this.bookingPrice.set(booking.price);
          const updated = booking.passengers.find((p) => p.idDocument === passenger.idDocument);
          this.passengers.update((list) =>
            list.map((p) => (p.idDocument === passenger.idDocument ? { ...p, luggage: updated?.luggage ?? null } : p))
          );
        },
        error: (error) => {
          this.savingPassengerId.set(null);
          this.handleError(error);
        },
      });
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.announcement.error('La reserva no existe. Busca los vuelos de nuevo.');
      this.bookingFlow.clear();
      this.router.navigate(['/catalogue']);
    } else if (error.status === 400 || error.status === 422) {
      // A rule failed (too many pieces, booking expired...): the backend explains which one
      this.announcement.error(`No se pudo actualizar el equipaje: ${error.error?.message ?? ''}`);
    } else {
      this.announcement.error('No se pudo actualizar el equipaje, intenta de nuevo.');
    }
  }
}