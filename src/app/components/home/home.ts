import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Airline } from '../../flights/airline';
import { Airport, AirportCode } from '../../flights/airport';
import { ExtraService } from '../../flights/extra-service';
import { AirlineService } from '../../services/airline';
import { AirportService } from '../../services/airport';
import { AuthService } from '../../services/auth';

// A destination chosen for the home page. The airport data (city, country) comes from the backend;
// the tagline and the picture (an icon and a gradient) are only for the page.
interface FeaturedDestination {
  code: AirportCode;
  tagline: string;
  icon: string;        // Font Awesome icon
  gradient: string;    // CSS background of the card
}

const NATIONAL_DESTINATIONS: FeaturedDestination[] = [
  { code: 'CTG', tagline: 'Murallas, mar y atardeceres', icon: 'fa-umbrella-beach', gradient: 'linear-gradient(135deg, #f7971e, #ffd200)' },
  { code: 'SMR', tagline: 'Sierra Nevada y playas del Caribe', icon: 'fa-water', gradient: 'linear-gradient(135deg, #00b4db, #0083b0)' },
  { code: 'ADZ', tagline: 'El mar de los siete colores', icon: 'fa-fish', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { code: 'MDE', tagline: 'La ciudad de la eterna primavera', icon: 'fa-seedling', gradient: 'linear-gradient(135deg, #56ab2f, #a8e063)' },
  { code: 'AXM', tagline: 'Café, palmas de cera y montaña', icon: 'fa-mug-hot', gradient: 'linear-gradient(135deg, #8e5a3c, #d39c6a)' },
  { code: 'LET', tagline: 'La puerta del Amazonas', icon: 'fa-tree', gradient: 'linear-gradient(135deg, #134e5e, #71b280)' },
];

const INTERNATIONAL_DESTINATIONS: FeaturedDestination[] = [
  { code: 'CUN', tagline: 'Playas turquesa y ruinas mayas', icon: 'fa-sun', gradient: 'linear-gradient(135deg, #ff7e5f, #feb47b)' },
  { code: 'MIA', tagline: 'Sol, compras y vida nocturna', icon: 'fa-city', gradient: 'linear-gradient(135deg, #ee0979, #ff6a00)' },
  { code: 'MAD', tagline: 'Arte, tapas y plazas', icon: 'fa-landmark', gradient: 'linear-gradient(135deg, #c31432, #f0a04b)' },
  { code: 'CDG', tagline: 'La ciudad de la luz', icon: 'fa-tower-observation', gradient: 'linear-gradient(135deg, #4b6cb7, #182848)' },
  { code: 'PUJ', tagline: 'Todo incluido frente al mar', icon: 'fa-umbrella-beach', gradient: 'linear-gradient(135deg, #2193b0, #6dd5ed)' },
  { code: 'HND', tagline: 'Tradición y futuro en un viaje', icon: 'fa-torii-gate', gradient: 'linear-gradient(135deg, #e53935, #e35d5b)' },
];

// An airline with its extra services, for its card
interface AirlineWithServices {
  airline: Airline;
  services: ExtraService[];
}

@Component({
  imports: [DecimalPipe, RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {

  private airlineService = inject(AirlineService);
  private airportService = inject(AirportService);
  private authService = inject(AuthService);

  isLoggedIn = this.authService.isAuthenticated;
  isCustomer = this.authService.isCustomer;

  // The backend catalog (GET /api/airports), by IATA code
  private airportsByCode = toSignal(
    this.airportService.getAirportsByCode().pipe(catchError(() => of(new Map<AirportCode, Airport>()))),
    { initialValue: new Map<AirportCode, Airport>() }
  );

  // Joins each featured code with its airport. A code the backend does not have is left out.
  nationalDestinations = computed(() => this.withAirport(NATIONAL_DESTINATIONS));
  internationalDestinations = computed(() => this.withAirport(INTERNATIONAL_DESTINATIONS));

  // GET /api/airlines and then GET /api/airlines/{id}/extra-services of each one, at the same time.
  // null = still loading
  airlines = toSignal<AirlineWithServices[] | null>(
    this.airlineService.getAirlines().pipe(
      switchMap((airlines) => {
        if (airlines.length === 0) return of([]);   // forkJoin of nothing never emits
        return forkJoin(airlines.map((airline) =>
          this.airlineService.getExtraServices(airline.id).pipe(
            catchError(() => of([] as ExtraService[])),           // an airline without services still shows
            map((services) => ({ airline, services }))
          )
        ));
      }),
      catchError(() => of([] as AirlineWithServices[]))
    ),
    { initialValue: null }
  );

  // Numbers for the strip under the hero
  airportCount = computed(() => this.airportsByCode().size);
  countryCount = computed(() => new Set([...this.airportsByCode().values()].map((airport) => airport.country)).size);

  private withAirport(destinations: FeaturedDestination[]) {
    return destinations
      .map((destination) => ({ ...destination, airport: this.airportsByCode().get(destination.code) }))
      .filter((destination) => destination.airport !== undefined);
  }
}