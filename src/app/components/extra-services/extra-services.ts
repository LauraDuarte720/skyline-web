import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { ExtraService, Page } from '../../flights/extra-service';
import { BookingExtraServiceResponse } from '../../flights/booking';
import { ExtraServiceService } from '../../services/extra-service';
import { BookingService } from '../../services/booking';
import { BookingFlowService } from '../../services/booking-flow';
import { NotificationsService } from '../../services/notifications';
import { BookingStep } from '../../guards/leave-booking-guard';

@Component({
  imports: [DecimalPipe],
  selector: 'app-extra-services',
  styleUrl: './extra-services.css',
  templateUrl: './extra-services.html',
})
export class ExtraServices implements BookingStep {

  private extraServiceService = inject(ExtraServiceService);
  private bookingService = inject(BookingService);
  private announcement = inject(NotificationsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  protected bookingFlow = inject(BookingFlowService);   // protected: the HTML uses it

  // Only the services of the flight's airline (outbound and return are the same airline)
  private airlineId = this.bookingFlow.outboundFlight()?.airlineId ?? '';

  // ================= Pagination (same pattern as the teacher's catalogue) =================

  // Which page and what text
  readonly size = 5;
  page = signal(0);
  text = signal('');

  // The text, but only after 400 ms without typing (and only if it changed)
  search = toSignal(
    toObservable(this.text).pipe(
      debounceTime(400),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  // Joins page and search in one object: when one of them changes, a new request is made
  private query = computed(() => ({
    page: this.page(),
    search: this.search(),
  }));

  response = toSignal(
    toObservable(this.query).pipe(
      switchMap(q => {
        if (!this.airlineId) return of(null);   // no flight chosen: nothing to search
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
    this.page.set(0);    // a new search starts on the first page
  }

  previous(): void { this.page.update(p => p - 1); }
  next(): void { this.page.update(p => p + 1); }

  // ================= Booking: services already added =================

  savingServiceId = signal<string | null>(null);   // service whose PUT is running (null = none)
  stepCompleted = signal(false);                    // true when leaving with "Continuar": the guard lets the user go
  bookingPrice = signal<number | null>(null);       // total of the booking, updated after every PUT
  chosen = signal<BookingExtraServiceResponse[]>([]);  // services already in the booking

  // The backend charges the international price if the outbound flight is international
  isInternational = computed(() => this.bookingFlow.outboundFlight()?.flightScope === 'INTERNATIONAL');

  constructor() {
    const bookingId = this.bookingFlow.bookingId();

    // Opened /extra-services without a booking: go back to the catalogue
    if (!bookingId || !this.airlineId) {
      this.router.navigate(['/catalogue']);
      return;
    }

    // Load what the booking already has (if the user comes back to this page)
    this.bookingService.getBooking(bookingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (booking) => {
          this.bookingPrice.set(booking.price);
          this.chosen.set(booking.extraServices ?? []);
        },
        error: (error) => this.handleError(error),
      });
  }

  // ---------- Used by the HTML ----------
  priceOf(service: ExtraService): number {
    return this.isInternational() ? service.internationalPrice : service.nationalPrice;
  }

  quantityOf(service: ExtraService): number {
    return this.chosen().find((detail) => detail.extraServiceId === service.id)?.quantity ?? 0;
  }

  // One PUT at a time: each one changes the booking price
  canAdd(): boolean {
    return this.savingServiceId() === null;
  }

  // The backend cannot remove a service (quantity must be > 0): the minimum is 1
  canRemove(service: ExtraService): boolean {
    return this.savingServiceId() === null && this.quantityOf(service) > 1;
  }

  add(service: ExtraService): void {
    if (this.canAdd()) {
      this.save(service, this.quantityOf(service) + 1);
    }
  }

  remove(service: ExtraService): void {
    if (this.canRemove(service)) {
      this.save(service, this.quantityOf(service) - 1);
    }
  }

  onContinue(): void {
    this.stepCompleted.set(true);   // must be before navigate, the guard checks it
    // TODO: change to the payment page when it exists
    this.router.navigate(['/']);
  }

  // ---------- PUT /api/bookings/{id}/extra-services ----------
  private save(service: ExtraService, quantity: number): void {
    const bookingId = this.bookingFlow.bookingId();
    if (!bookingId) return;

    this.savingServiceId.set(service.id);
    this.bookingService.addExtraService(bookingId, { extraServiceId: service.id, quantity })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (booking) => {
          this.savingServiceId.set(null);
          // The answer has the new total and every service of the booking
          this.bookingPrice.set(booking.price);
          this.chosen.set(booking.extraServices);
        },
        error: (error) => {
          this.savingServiceId.set(null);
          this.handleError(error);
        },
      });
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.announcement.error('La reserva o el servicio no existe. Busca los vuelos de nuevo.');
      this.bookingFlow.clear();
      this.router.navigate(['/catalogue']);
    } else if (error.status === 400 || error.status === 422) {
      // A rule failed (booking expired, service deleted...): the backend explains which one
      this.announcement.error(`No se pudo agregar el servicio: ${error.error?.message ?? ''}`);
    } else {
      this.announcement.error('No se pudo agregar el servicio, intenta de nuevo.');
    }
  }
}