import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AIRCRAFT_MODELS, AircraftResponse } from '../../flights/aircraft';
import { Airport } from '../../flights/airport';
import { CreateLegRequest, LegResponse } from '../../flights/leg';
import { AircraftService } from '../../services/aircraft';
import { AirportService } from '../../services/airport';
import { LegService } from '../../services/leg';
import { NotificationsService } from '../../services/notifications';
import { arrivalAfterDeparture, differentAirports } from '../../validators/form-validators';

@Component({
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, RouterLink],
  selector: 'app-airline-legs',
  styleUrl: './airline-legs.css',
  templateUrl: './airline-legs.html',
})
export class AirlineLegs {

  private legService = inject(LegService);
  private announcement = inject(NotificationsService);
  private destroyRef = inject(DestroyRef);

  // Catalog of airports for the <select>s (the same list as the flights search)
  airports = toSignal(inject(AirportService).getAirports(), { initialValue: [] as Airport[] });

  // Aircraft of the airline for the <select> (GET /api/aircrafts). null while they load.
  aircrafts = toSignal<AircraftResponse[] | null>(
    inject(AircraftService).getMine().pipe(
      catchError(() => {
        this.announcement.error('No pudimos cargar tus aviones.');
        return of([] as AircraftResponse[]);
      })
    ),
    { initialValue: null }
  );

  // "Airbus A320neo · 194 sillas · a1b2c3": the short id tells apart two aircraft of the same model
  aircraftLabel(aircraft: AircraftResponse): string {
    const model = AIRCRAFT_MODELS.find((m) => m.value === aircraft.aircraftModel)?.label ?? aircraft.aircraftModel;
    return `${model} · ${aircraft.seats.length} sillas · ${aircraft.id.slice(0, 6)}`;
  }

  isSaving = signal(false);
  // Legs created while the page is open. The backend has no endpoint to list them.
  created = signal<LegResponse[]>([]);

  // Same rules as the backend (CreateLegRequest + Leg.createLeg)
  legForm = inject(FormBuilder).nonNullable.group({
    origin: ['', Validators.required],
    destination: ['', Validators.required],
    departureTime: ['', Validators.required],
    arrivalTime: ['', Validators.required],
    aircraftId: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],          // greater than 0
    luggagePrice: [0, [Validators.required, Validators.min(0)]],   // 0 or more
  }, { validators: [differentAirports, arrivalAfterDeparture] });

  onSubmit(): void {
    if (this.legForm.invalid || this.isSaving()) {
      this.legForm.markAllAsTouched();
      return;
    }

    const form = this.legForm.getRawValue();
    const request: CreateLegRequest = {
      originAirport: form.origin,
      destinationAirport: form.destination,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      aircraftId: form.aircraftId,
      luggagePrice: form.luggagePrice,
      price: form.price,
    };

    this.isSaving.set(true);
    this.legService.create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (leg) => {
          this.isSaving.set(false);
          this.created.update((list) => [leg, ...list]);   // the newest first
          this.announcement.success(`Tramo ${leg.originAirport} → ${leg.destinationAirport} programado.`);
          // Keep the aircraft and the prices: the next leg is usually the same aircraft
          this.legForm.patchValue({ origin: form.destination, destination: '', departureTime: '', arrivalTime: '' });
          this.legForm.markAsUntouched();
        },
        error: (error) => {
          this.isSaving.set(false);
          this.handleError(error);
        },
      });
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.announcement.error('El avión ya no existe. Recarga la página.');
    } else if (error.status === 400 || error.status === 422) {
      // 400: a missing field or an unknown airport. 422: a rule (aircraft of another airline,
      // overlapping leg, arrival before departure...). The backend explains which one.
      const fields = error.error?.errors ? Object.values(error.error.errors).join(' ') : '';
      this.announcement.error(`No se pudo programar el tramo: ${fields || error.error?.message || ''}`);
    } else if (error.status === 403) {
      this.announcement.error('No tienes permiso para programar tramos.');
    } else {
      this.announcement.error('No se pudo programar el tramo, intenta de nuevo.');
    }
  }
}