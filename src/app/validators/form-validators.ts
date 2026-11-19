import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validators of a whole form group (they compare two fields), shared by several pages.

// Origin and destination can't be the same airport. The group must have "origin" and "destination".
export function differentAirports(form: AbstractControl): ValidationErrors | null {
  const origin = form.get('origin')?.value;
  const destination = form.get('destination')?.value;
  return origin && origin === destination ? { sameAirport: true } : null;
}

// The arrival must be after the departure. The group must have "departureTime" and "arrivalTime"
// as "YYYY-MM-DDTHH:mm" (an <input type="datetime-local">): texts in that format sort like dates.
export function arrivalAfterDeparture(form: AbstractControl): ValidationErrors | null {
  const departure = form.get('departureTime')?.value;
  const arrival = form.get('arrivalTime')?.value;
  return departure && arrival && arrival <= departure ? { arrivalBeforeDeparture: true } : null;
}