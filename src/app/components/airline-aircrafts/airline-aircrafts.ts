import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

  isSaving = signal(false);
  // Aircraft created while the page is open. The backend has no endpoint to list them,
  // so this list starts empty every time the page opens.
  created = signal<AircraftResponse[]>([]);

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
          this.created.update((list) => [aircraft, ...list]);   // the newest first
          this.announcement.success(`Avión ${this.labelOf(aircraft.aircraftModel)} registrado.`);
          this.aircraftForm.reset();
        },
        error: (error) => {
          this.isSaving.set(false);
          this.handleError(error);
        },
      });
  }

  // The id is needed to create a leg: copy it so the user can paste it there
  copyId(aircraft: AircraftResponse): void {
    navigator.clipboard.writeText(aircraft.id)
      .then(() => this.announcement.info('Id copiado.'))
      .catch(() => this.announcement.error('No se pudo copiar, selecciónalo y cópialo a mano.'));
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