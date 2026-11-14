import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Flight } from '../../flights/catalogue';
import { DecimalPipe,DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { FlightService } from '../../services/flight';
import { signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlightSearchRequest } from '../../flights/catalogue';
import { FlightScope } from '../../flights/catalogue';
@Component({
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, DatePipe],
  selector: 'app-catalogue',
  styleUrl: './catalogue.css',
  templateUrl: './catalogue.html',
})


export class Catalogue {

  private flightService = inject(FlightService);


    flightForm = inject(FormBuilder).group ({
    origin: ['', [Validators.required]],
    destination: ['', [Validators.required]],
    departureDay: ['', [Validators.required]],
    passengers: [1, [Validators.required]],
  });


  flights = signal<Flight[]>([]);

onSearch(): void {
  const searchRequest = this.flightForm.value as FlightSearchRequest;
  this.flightService.searchFlights(searchRequest)
    .subscribe(flights => this.flights.set(flights));
}

badgeFlightScope(flightScope: FlightScope): string {
  const colors: Record<FlightScope, string> = {
    'NATIONAL': 'bg-primary-subtle',
    'INTERNATIONAL': 'bg-dark-subtle',
}
return colors[flightScope] ?? 'bg-secondary-subtle';
}
}
