import { Injectable, computed, signal } from '@angular/core';
import { BookingFlow } from '../flights/booking-flow';
import { Flight } from '../flights/catalogue';
import { TripType } from '../flights/booking';

const STORAGE_KEY = 'bookingFlow';

const EMPTY_FLOW: BookingFlow = {
    tripType: null,
    passengers: null,
    outboundFlight: null,
    returnFlight: null,
    bookingId: null,
};

@Injectable({ providedIn: 'root' })
export class BookingFlowService {
    private flow = signal<BookingFlow>(this.load());

    tripType = computed(() => this.flow().tripType);
    passengers = computed(() => this.flow().passengers);
    outboundFlight = computed(() => this.flow().outboundFlight);
    returnFlight = computed(() => this.flow().returnFlight);
    bookingId = computed(() => this.flow().bookingId);

     isRoundTrip = computed(() => this.flow().tripType === 'ROUND_TRIP');


     // true when the user can go to /book
    flightsChosen = computed(() => {
        if (!this.outboundFlight()) return false;
        return !this.isRoundTrip() || this.returnFlight() !== null;
    });

    startSearch(tripType: TripType, passengers: number): void {
        this.save({ ...EMPTY_FLOW, tripType, passengers });
    }

    selectOutbound(flight: Flight): void {
        this.update({ outboundFlight: flight, returnFlight: null });
    }

    selectReturn(flight: Flight): void {
        this.update({ returnFlight: flight });
    }

    clear(): void {
        sessionStorage.removeItem(STORAGE_KEY);
        this.flow.set(EMPTY_FLOW);
    }

    private update(changes: Partial<BookingFlow>): void {
        this.save({ ...this.flow(), ...changes });
    }

    private save(flow: BookingFlow): void {
        this.flow.set(flow);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
    }

    setBookingId(bookingId: string): void {
    this.update({ bookingId });
}

    private load(): BookingFlow {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : EMPTY_FLOW;
        } catch {
            return EMPTY_FLOW;   // corrupted data in storage: start empty instead of breaking the page
        }
    }




}
