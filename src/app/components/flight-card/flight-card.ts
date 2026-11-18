import { Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Flight, FlightScope } from '../../flights/catalogue';

@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-flight-card',
  styleUrl: './flight-card.css',
  templateUrl: './flight-card.html',
})
export class FlightCard {

  flight = input.required<Flight>();
  selected = input(false);
  actionLabel = input('Select')

  choose = output<Flight>();

  badgeFlightScope(flightScope: FlightScope): string {
    const colors: Record<FlightScope, string> = {
      'NATIONAL': 'bg-primary-subtle',
      'INTERNATIONAL': 'bg-dark-subtle',
    };
    return colors[flightScope] ?? 'bg-secondary-subtle';
  }

}
