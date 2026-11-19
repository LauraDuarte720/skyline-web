import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { Airline, CreateAirlineRequest } from '../../flights/airline';
import { AirlineService } from '../../services/airline';
import { NotificationsService } from '../../services/notifications';

@Component({
  imports: [ReactiveFormsModule, DecimalPipe],
  selector: 'app-admin-airlines',
  styleUrl: './admin-airlines.css',
  templateUrl: './admin-airlines.html',
})
export class AdminAirlines {

  private airlineService = inject(AirlineService);
  private announcement = inject(NotificationsService);
  private destroyRef = inject(DestroyRef);

  // ================= List: every airline (GET /api/airlines) =================

  private reload = signal(0);   // +1 after creating one: asks the list again

  // Same idea as the paginated lists: when reload changes, switchMap asks the backend again
  airlines = toSignal(
    toObservable(this.reload).pipe(
      switchMap(() =>
        this.airlineService.getAirlines().pipe(
          catchError(() => {
            this.announcement.error('No pudimos cargar las aerolíneas.');
            return of([] as Airline[]);
          })
        )
      )
    ),
    { initialValue: [] as Airline[] }
  );

  // ================= Create =================

  isSaving = signal(false);

  // Same rules as the backend (CreateAirlineRequest + Airline.createAirline)
  airlineForm = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    maximumLuggageAmount: [1, [Validators.required, Validators.min(1)]],   // greater than 0
    seatPrice: [0, [Validators.required, Validators.min(0)]],              // 0 or more
  });

  onCreate(): void {
    if (this.airlineForm.invalid || this.isSaving()) {
      this.airlineForm.markAllAsTouched();
      return;
    }

    const form = this.airlineForm.getRawValue();
    const request: CreateAirlineRequest = {
      name: form.name.trim(),
      maximumLuggageAmount: form.maximumLuggageAmount,
      seatPrice: form.seatPrice,
    };

    this.isSaving.set(true);
    this.airlineService.create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (airline) => {
          this.isSaving.set(false);
          this.announcement.success(`Aerolínea "${airline.name}" creada. Ahora regístrale un administrador.`);
          this.airlineForm.reset();
          this.reload.update(r => r + 1);
        },
        error: (error) => {
          this.isSaving.set(false);
          this.handleError(error);
        },
      });
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 400 || error.status === 422) {
      const fields = error.error?.errors ? Object.values(error.error.errors).join(' ') : '';
      this.announcement.error(`No se pudo crear la aerolínea: ${fields || error.error?.message || ''}`);
    } else if (error.status === 403) {
      this.announcement.error('Solo el administrador de la plataforma puede crear aerolíneas.');
    } else {
      this.announcement.error('No se pudo crear la aerolínea, intenta de nuevo.');
    }
  }
}