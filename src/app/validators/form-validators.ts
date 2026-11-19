import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validators of a whole form group (they compare two fields), shared by several pages.

// Origin and destination can't be the same airport. The group must have "origin" and "destination".
export function differentAirports(form: AbstractControl): ValidationErrors | null {
  const origin = form.get('origin')?.value;
  const destination = form.get('destination')?.value;
  return origin && origin === destination ? { sameAirport: true } : null;
}
