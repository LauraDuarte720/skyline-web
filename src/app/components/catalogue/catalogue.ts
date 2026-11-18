import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { Flight, TripSearch } from '../../flights/catalogue';
import { TripType } from '../../flights/booking';
import { Airport } from '../../flights/airport';
import { FlightService } from '../../services/flight';
import { AirportService } from '../../services/airport';
import { BookingFlowService } from '../../services/booking-flow';
import { NotificationsService } from '../../services/notifications';
import { FlightCard } from '../flight-card/flight-card';

// What a search returns: outbound flights and (for a round trip) return flights
interface SearchResult {
  outbound: Flight[];
  returning: Flight[];
}

// Origin and destination can't be the same airport
function differentAirports(form: AbstractControl): ValidationErrors | null {
  const origin = form.get('origin')?.value;
  const destination = form.get('destination')?.value;
  return origin && origin === destination ? { sameAirport: true } : null;
}

@Component({
  imports: [ReactiveFormsModule, FlightCard],
  selector: 'app-catalogue',
  styleUrl: './catalogue.css',
  templateUrl: './catalogue.html',
})
export class Catalogue {

  private flightService = inject(FlightService);
  private airportService = inject(AirportService);
  private announcement = inject(NotificationsService);
  private router = inject(Router);
  protected bookingFlow = inject(BookingFlowService);   // protected: the HTML uses it

  // Catalog of airports for the dropdowns (GET /api/airports)
  airports = toSignal(this.airportService.getAirports(), { initialValue: [] as Airport[] });

  // nonNullable: getRawValue() gives string/number instead of string | null
  flightForm = inject(FormBuilder).nonNullable.group({
    tripType: ['ONE_WAY' as TripType, [Validators.required]],
    origin: ['', [Validators.required]],
    destination: ['', [Validators.required]],
    departureDay: ['', [Validators.required]],
    returnDay: [''],
    passengers: [1, [Validators.required, Validators.min(1)]],
  }, { validators: differentAirports });

  // Trip type marked now in the form (shows or hides the return date)
  private formTripType = toSignal(this.flightForm.controls.tripType.valueChanges,
    { initialValue: this.flightForm.controls.tripType.value });
  roundTripSelected = computed(() => this.formTripType() === 'ROUND_TRIP');

  // The search the user submitted (null until the first search)
  private currentSearch = signal<TripSearch | null>(null);

  // Every time currentSearch changes, the backend is asked again
  private response = toSignal(
    toObservable(this.currentSearch).pipe(
      switchMap((search) => {
        if (!search) return of(null);

        const outbound$ = this.flightService.searchFlights({
          origin: search.origin,
          destination: search.destination,
          departureDay: search.departureDay,
          passengers: search.passengers,
        });

        // Return = the same trip reversed, on the return day
        const returning$ = search.returnDay
          ? this.flightService.searchFlights({
              origin: search.destination,
              destination: search.origin,
              departureDay: search.returnDay,
              passengers: search.passengers,
            })
          : of<Flight[]>([]);

        return forkJoin({ outbound: outbound$, returning: returning$ }).pipe(
          catchError((error) => {
            if (error.status === 400) {
              this.announcement.error('Revisa los datos de búsqueda');
            } else {
              this.announcement.error('No se pudieron buscar los vuelos, intenta de nuevo');
            }
            return of(null);
          })
        );
      })
    ),
    { initialValue: null as SearchResult | null }
  );

  outboundFlights = computed(() => this.response()?.outbound ?? []);
  returnFlights = computed(() => this.response()?.returning ?? []);
  searched = computed(() => this.response() !== null);

  // Only the return flights the backend accepts:
  // same airline, and leaving after the outbound flight arrives
  compatibleReturnFlights = computed(() => {
    const outbound = this.bookingFlow.outboundFlight();
    if (!outbound) return [];
    const outboundArrival = new Date(outbound.arrivalTime).getTime();
    return this.returnFlights().filter((flight) =>
      flight.airlineId === outbound.airlineId &&
      new Date(flight.departureTime).getTime() > outboundArrival);
  });

  constructor() {
    // The return date is required only for a round trip
    effect(() => {
      const returnDay = this.flightForm.controls.returnDay;
      if (this.roundTripSelected()) {
        returnDay.setValidators([Validators.required]);
      } else {
        returnDay.clearValidators();
        returnDay.setValue('');
      }
      returnDay.updateValueAndValidity();
    });
  }

  onSearch(): void {
    if (this.flightForm.invalid) return;
    const form = this.flightForm.getRawValue();

    const search: TripSearch = {
      tripType: form.tripType,
      origin: form.origin,
      destination: form.destination,
      departureDay: form.departureDay,
      returnDay: form.tripType === 'ROUND_TRIP' ? form.returnDay : null,
      passengers: form.passengers,
    };

    this.bookingFlow.startSearch(search.tripType, search.passengers);   // only what the other pages need
    this.currentSearch.set(search);                                     // starts the search
  }

  onContinue(): void {
    this.router.navigate(['/book']);
  }
}