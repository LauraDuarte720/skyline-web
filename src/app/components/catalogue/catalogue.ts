import { Component, inject } from '@angular/core';
import { Flight } from '../../flights/catalogue';
import { map } from 'rxjs';
import { FlightService } from '../../services/flight';
import { signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlightSearchRequest } from '../../flights/catalogue';

@Component({
  imports: [ReactiveFormsModule],
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
}
