import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { BookingDetail, LegSeatResponse, PassengerDetailResponse, SelectSeatRequest } from '../../flights/booking';
import { Flight } from '../../flights/catalogue';
import { AirportCode } from '../../flights/airport';
import { BookingService } from '../../services/booking';
import { BookingFlowService } from '../../services/booking-flow';
import { NotificationsService } from '../../services/notifications';

// One leg of the booking, shown as a tab
interface LegTab {
  legId: string;
  direction: 'Ida' | 'Regreso';
  origin: AirportCode;
  destination: AirportCode;
}

// One row of the cabin: the seats left and right of the aisle (null = no seat in that place)
interface CabinRow {
  number: number;
  left: (LegSeatResponse | null)[];
  right: (LegSeatResponse | null)[];
}

// free: available · taken: someone else's · mine: another passenger of this booking · active: the selected passenger's
type SeatState = 'free' | 'taken' | 'mine' | 'active';

// A flight with layovers has one leg per segment: BOG→MDE→CTG gives [BOG→MDE, MDE→CTG]
function legsOf(flight: Flight, direction: LegTab['direction']): LegTab[] {
  const stops = [flight.originAirport, ...flight.layovers.map((layover) => layover.airport), flight.destinationAirport];
  return flight.legIds.map((legId, i) => ({ legId, direction, origin: stops[i], destination: stops[i + 1] }));
}

// "12C" → 12
function seatRowNumber(seatCode: string): number {
  return parseInt(seatCode, 10);
}

// "12C" → "C"
function seatColumn(seatCode: string): string {
  return seatCode.replace(/[0-9]/g, '');
}

@Component({
  imports: [DecimalPipe],
  selector: 'app-seat-selector',
  styleUrl: './seat-selector.css',
  templateUrl: './seat-selector.html',
})
export class SeatSelector {

  private bookingService = inject(BookingService);
  private bookingFlow = inject(BookingFlowService);
  private announcement = inject(NotificationsService);
  private router = inject(Router);

  // ---------- Legs (tabs) ----------
  legs = computed(() => {
    const outbound = this.bookingFlow.outboundFlight();
    const returning = this.bookingFlow.returnFlight();
    return [
      ...(outbound ? legsOf(outbound, 'Ida') : []),
      ...(returning ? legsOf(returning, 'Regreso') : []),
    ];
  });
  activeLegIndex = signal(0);
  activeLeg = computed(() => this.legs()[this.activeLegIndex()] ?? null);


    // ---------- Reload ----------
  // Changing this number asks the backend again for the booking and the seat map
  private reload = signal(0);
  saving = signal(false);

  // ---------- Booking: passengers and their seats ----------
  private booking = toSignal(
    toObservable(this.reload).pipe(
      switchMap(() => {
        const bookingId = this.bookingFlow.bookingId();
        if (!bookingId) return of(null);
        return this.bookingService.getBooking(bookingId).pipe(
          catchError(() => {
            this.announcement.error('No se pudo cargar la reserva');
            return of(null);
          })
        );
      })
    ),
    { initialValue: null as BookingDetail | null }
  );

  passengers = computed(() => this.booking()?.passengers ?? []);
  totalPrice = computed(() => this.booking()?.price ?? 0);

  // ---------- Seat map of the active leg ----------
  private seatMapRequest = computed(() => ({ legId: this.activeLeg()?.legId ?? null, reload: this.reload() }));

  private seats = toSignal(
    toObservable(this.seatMapRequest).pipe(
      switchMap(({ legId }) => {
        if (!legId) return of<LegSeatResponse[]>([]);
        return this.bookingService.getLegSeatMap(legId).pipe(
          map((response) => response.seats),
          catchError(() => {
            this.announcement.error('No se pudo cargar el mapa de asientos');
            return of<LegSeatResponse[]>([]);
          })
        );
      })
    ),
    { initialValue: [] as LegSeatResponse[] }
  );

    // The seats arranged as a cabin: columns on each side of the aisle, and rows
  cabin = computed(() => {
    const seats = this.seats();
    const columns = [...new Set(seats.map((seat) => seatColumn(seat.seatCode)))].sort();
    const half = Math.ceil(columns.length / 2);
    const leftColumns = columns.slice(0, half);
    const rightColumns = columns.slice(half);
    const rowNumbers = [...new Set(seats.map((seat) => seatRowNumber(seat.seatCode)))].sort((a, b) => a - b);

    const byCode = new Map<string, LegSeatResponse>(seats.map((seat) => [seat.seatCode, seat]));
    const seatAt = (row: number, column: string) => byCode.get(`${row}${column}`) ?? null;

    const rows: CabinRow[] = rowNumbers.map((number) => ({
      number,
      left: leftColumns.map((column) => seatAt(number, column)),
      right: rightColumns.map((column) => seatAt(number, column)),
    }));
    return { leftColumns, rightColumns, rows };
  });

  // ---------- Passengers ----------
  // Seats of this booking on the active leg: legSeatId → passenger
  private seatOwners = computed(() => {
    const legId = this.activeLeg()?.legId;
    const owners = new Map<string, PassengerDetailResponse>();
    for (const passenger of this.passengers()) {
      const seat = passenger.seats.find((s) => s.legId === legId);
      if (seat) owners.set(seat.legSeatId, passenger);
    }
    return owners;
  });

  private activePassengerId = signal<string | null>(null);
  activePassenger = computed(() => {
    const passengers = this.passengers();
    return passengers.find((p) => p.idDocument === this.activePassengerId()) ?? passengers[0] ?? null;
  });

  constructor() {
    // Opened without a booking: go back to the catalogue
    if (!this.bookingFlow.bookingId() || this.legs().length === 0) {
      this.router.navigate(['/catalogue']);
    }
  }

  // ---------- Used by the HTML ----------
  seatState(seat: LegSeatResponse): SeatState {
    const owner = this.seatOwners().get(seat.id);
    if (owner) {
      return owner.idDocument === this.activePassenger()?.idDocument ? 'active' : 'mine';
    }
    return seat.status === 'AVAILABLE' ? 'free' : 'taken';
  }

  seatLabel(seat: LegSeatResponse): string {
    const owner = this.seatOwners().get(seat.id);
    return owner ? this.initials(owner) : '';
  }

  seatTitle(seat: LegSeatResponse): string {
    const owner = this.seatOwners().get(seat.id);
    if (owner) {
      const isActive = owner.idDocument === this.activePassenger()?.idDocument;
      return `${seat.seatCode} · ${owner.firstName}${isActive ? ' · toca para liberarlo' : ''}`;
    }
    return seat.status === 'AVAILABLE' ? `${seat.seatCode} · libre` : `${seat.seatCode} · ocupado`;
  }

  seatCodeOf(passenger: PassengerDetailResponse): string | null {
    const legId = this.activeLeg()?.legId;
    return passenger.seats.find((s) => s.legId === legId)?.seatCode ?? null;
  }

  legComplete(legId: string): boolean {
    const passengers = this.passengers();
    return passengers.length > 0 && passengers.every((p) => p.seats.some((s) => s.legId === legId));
  }

  initials(passenger: PassengerDetailResponse): string {
    return `${passenger.firstName[0] ?? ''}${passenger.lastName1[0] ?? ''}`.toUpperCase();
  }

  selectLeg(index: number): void {
    this.activeLegIndex.set(index);
  }

  selectPassenger(passenger: PassengerDetailResponse): void {
    this.activePassengerId.set(passenger.idDocument);
  }

  // ---------- Assigning or releasing a seat ----------
  onSeatClick(seat: LegSeatResponse): void {
    const passenger = this.activePassenger();
    const leg = this.activeLeg();
    const bookingId = this.bookingFlow.bookingId();
    if (!passenger || !leg || !bookingId || this.saving()) return;

    const state = this.seatState(seat);
    if (state === 'mine') {
      // Another passenger's seat: select that passenger instead
      this.selectPassenger(this.seatOwners().get(seat.id)!);
      return;
    }
    if (state === 'taken') return;

    // Clicking the selected passenger's own seat again releases it (legSeatId null)
    const releasing = state === 'active';
    const request: SelectSeatRequest = {
      legId: leg.legId,
      legSeatId: releasing ? null : seat.id,
      passengerId: passenger.idDocument,
    };
    const action = releasing ? 'liberar' : 'asignar';

    this.saving.set(true);
    this.bookingService.selectLegSeat(bookingId, request).subscribe({
      next: () => {
        this.saving.set(false);
        if (!releasing) this.advanceFrom(passenger, leg.legId);   // after releasing, stay on this passenger
        this.reload.update((n) => n + 1);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        if (error.status === 422) {
          this.announcement.error(`No se pudo ${action} el asiento: ${error.error?.message ?? ''}`);
        } else {
          this.announcement.error(`No se pudo ${action} el asiento, intenta de nuevo`);
        }
        this.reload.update((n) => n + 1);   // show the real state (someone may have taken it)
      },
    });
  }

  // Auto-advance: select the next passenger (after this one) with no seat on this leg
  private advanceFrom(passenger: PassengerDetailResponse, legId: string): void {
    const passengers = this.passengers();
    const start = passengers.indexOf(passenger);
    for (let step = 1; step < passengers.length; step++) {
      const next = passengers[(start + step) % passengers.length];
      if (!next.seats.some((s) => s.legId === legId)) {
        this.activePassengerId.set(next.idDocument);
        return;
      }
    }
  }

}