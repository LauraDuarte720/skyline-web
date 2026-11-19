import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { CreateExtraServiceRequest, ExtraService, Page } from '../../flights/extra-service';
import { ExtraServiceService } from '../../services/extra-service';
import { AuthService } from '../../services/auth';
import { NotificationsService } from '../../services/notifications';

@Component({
  imports: [ReactiveFormsModule, DecimalPipe],
  selector: 'app-airline-extra-services',
  styleUrl: './airline-extra-services.css',
  templateUrl: './airline-extra-services.html',
})
export class AirlineExtraServices {

  private extraServiceService = inject(ExtraServiceService);
  private announcement = inject(NotificationsService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder).nonNullable;

  // The airline of the logged-in user (read from the token). Only its services are listed.
  private airlineId = inject(AuthService).airlineId() ?? '';

  // ================= List: same pagination pattern as the teacher's catalogue =================

  readonly size = 5;
  page = signal(0);
  text = signal('');
  private reload = signal(0);   // +1 after creating or deleting: asks the same page again

  search = toSignal(
    toObservable(this.text).pipe(
      debounceTime(400),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  // reload is in the query only to make it change: then switchMap asks the backend again
  private query = computed(() => ({
    page: this.page(),
    search: this.search(),
    reload: this.reload(),
  }));

  response = toSignal(
    toObservable(this.query).pipe(
      switchMap(q => {
        if (!this.airlineId) return of(null);   // without airline it would list every airline
        return this.extraServiceService.search(q.page, this.size, q.search, this.airlineId).pipe(
          catchError(() => {
            this.announcement.error('No pudimos cargar los servicios extra.');
            return of(null);
          })
        );
      })
    ),
    { initialValue: null as Page<ExtraService> | null }
  );

  extraServices = computed(() => this.response()?.content ?? []);
  totalPages = computed(() => this.response()?.totalPages ?? 0);
  total = computed(() => this.response()?.totalElements ?? 0);
  isFirst = computed(() => this.page() === 0);
  isLast = computed(() => this.page() >= this.totalPages() - 1);

  write(value: string): void {
    this.text.set(value);
    this.page.set(0);
  }

  previous(): void { this.page.update(p => p - 1); }
  next(): void { this.page.update(p => p + 1); }

  // ================= Create =================

  isSaving = signal(false);

  // Same rules as the backend: name required, prices 0 or more
  serviceForm = this.fb.group({
    nameService: ['', Validators.required],
    description: [''],
    nationalPrice: [0, [Validators.required, Validators.min(0)]],
    internationalPrice: [0, [Validators.required, Validators.min(0)]],
  });

  onCreate(): void {
    if (this.serviceForm.invalid || this.isSaving()) {
      this.serviceForm.markAllAsTouched();   // shows the errors of the fields the user did not touch
      return;
    }

    const form = this.serviceForm.getRawValue();
    const request: CreateExtraServiceRequest = {
      nameService: form.nameService.trim(),
      description: form.description.trim(),
      nationalPrice: form.nationalPrice,
      internationalPrice: form.internationalPrice,
    };

    this.isSaving.set(true);
    this.extraServiceService.create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (service) => {
          this.isSaving.set(false);
          this.announcement.success(`Servicio "${service.nameService}" creado.`);
          this.serviceForm.reset();      // nonNullable: goes back to '' and 0, not to null
          this.reload.update(r => r + 1);
        },
        error: (error) => {
          this.isSaving.set(false);
          this.handleError(error, 'crear');
        },
      });
  }

  // ================= Delete =================

  deletingId = signal<string | null>(null);   // service whose DELETE is running

  onDelete(service: ExtraService): void {
    if (this.deletingId() !== null) return;
    if (!confirm(`¿Eliminar "${service.nameService}"? Ya no se podrá agregar a nuevas reservas.`)) return;

    this.deletingId.set(service.id);
    this.extraServiceService.delete(service.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingId.set(null);
          this.announcement.success(`Servicio "${service.nameService}" eliminado.`);
          // It was the only one of this page: go back one page (that also reloads)
          if (this.extraServices().length === 1 && this.page() > 0) {
            this.page.update(p => p - 1);
          } else {
            this.reload.update(r => r + 1);
          }
        },
        error: (error) => {
          this.deletingId.set(null);
          this.handleError(error, 'eliminar');
        },
      });
  }

  private handleError(error: HttpErrorResponse, action: string): void {
    if (error.status === 400 || error.status === 422) {
      // A rule failed (empty name, negative price, already deleted...): the backend explains which one
      this.announcement.error(`No se pudo ${action} el servicio: ${error.error?.message ?? ''}`);
    } else if (error.status === 403) {
      this.announcement.error('No tienes permiso para hacer esto.');
    } else if (error.status === 404) {
      this.announcement.error('El servicio no existe o no es de tu aerolínea.');
      this.reload.update(r => r + 1);
    } else {
      this.announcement.error(`No se pudo ${action} el servicio, intenta de nuevo.`);
    }
  }
}