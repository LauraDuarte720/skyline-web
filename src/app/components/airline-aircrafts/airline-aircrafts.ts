import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { AIRCRAFT_MODELS, AircraftModel, AircraftResponse } from '../../flights/aircraft';
import { AircraftService } from '../../services/aircraft';
import { NotificationsService } from '../../services/notifications';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-airline-aircrafts',
  styleUrl: './airline-aircrafts.css',
  templateUrl: './airline-aircrafts.html',
})
export class AirlineAircrafts {

  private aircraftService = inject(AircraftService);
  private announcement = inject(NotificationsService);
  private destroyRef = inject(DestroyRef);

  models = AIRCRAFT_MODELS;

  // ================= List: the aircraft of the airline (GET /api/aircrafts) =================

  private reload = signal(0);   // +1 after creating one: asks the list again

  // Same idea as the airlines page: when reload changes, switchMap asks the backend again
  aircrafts = toSignal(
    toObservable(this.reload).pipe(
      switchMap(() =>
        this.aircraftService.getMine().pipe(
          catchError(() => {
            this.announcement.error('No pudimos cargar los aviones.');
            return of([] as AircraftResponse[]);
          })
        )
      )
    ),
    { initialValue: [] as AircraftResponse[] }
  );

  // ================= Create =================

  isSaving = signal(false);

  aircraftForm = inject(FormBuilder).nonNullable.group({
    aircraftModel: ['' as AircraftModel | '', Validators.required],
  });

  onSubmit(): void {
    if (this.aircraftForm.invalid || this.isSaving()) {
      this.aircraftForm.markAllAsTouched();
      return;
    }

    const model = this.aircraftForm.getRawValue().aircraftModel as AircraftModel;

    this.isSaving.set(true);
    this.aircraftService.create({ aircraftModel: model })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (aircraft) => {
          this.isSaving.set(false);
          this.announcement.success(`Avión ${this.labelOf(aircraft.aircraftModel)} registrado.`);
          this.aircraftForm.reset();
          this.reload.update(r => r + 1);
        },
        error: (error) => {
          this.isSaving.set(false);
          this.handleError(error);
        },
      });
  }

  labelOf(model: AircraftModel): string {
    return this.models.find((m) => m.value === model)?.label ?? model;
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 400 || error.status === 422) {
      this.announcement.error(`No se pudo registrar el avión: ${error.error?.message ?? ''}`);
    } else if (error.status === 403) {
      this.announcement.error('No tienes permiso para registrar aviones.');
    } else if (error.status === 404) {
      this.announcement.error('Tu aerolínea no existe. Inicia sesión de nuevo.');
    } else {
      this.announcement.error('No se pudo registrar el avión, intenta de nuevo.');
    }
  }
}