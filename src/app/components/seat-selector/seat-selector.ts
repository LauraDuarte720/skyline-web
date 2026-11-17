import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {SelectSeatRequest, LegSeatResponse} from '../../flights/booking';
import { BookingService } from '../../services/booking';
import { takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { NotificationsService } from '../../services/notifications';


@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-seat-selector',
  styleUrl: './seat-selector.css',
  templateUrl: './seat-selector.html',
})
export class SeatSelector {
  private bookingService = inject(BookingService);
  private announcement = inject(NotificationsService)
  private destroyRef = inject(DestroyRef);

  result = signal('');
  isLoading = signal(false);

  seatForm = inject(FormBuilder).group ({
    legId: ['', [Validators.required]],
    legSeatId: ['', [Validators.required]],
    passengerId: ['', [Validators.required]],
  })
  bookingId = inject(FormBuilder).group ({
    bookingId: ['', [Validators.required]],
  })

  legForm = inject(FormBuilder).group ({
    legId: ['', [Validators.required]],
  })

  seats = signal<LegSeatResponse[]>([]);

  onSearchSeats(): void {
    this.bookingService.getLegSeatMap(this.legForm.value.legId as string).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.seats.set(response.seats);
        this.announcement.success('Seats retrieved successfully');
      },
      error: (error) => {
        if (error.status === 404) {
          this.announcement.error('Leg not found');
        } else {
          this.announcement.error('Failed to retrieve seats');
        }
      }
    });

  }

  
  onSubmit(): void {
    if (this.seatForm.invalid) return;
    this.result.set('');
    const seatRequest = this.seatForm.value as SelectSeatRequest;
    const bookingId = this.bookingId.value.bookingId as string;

    this.isLoading.set(true);
    
    this.bookingService.selectLegSeat(bookingId, seatRequest).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.result.set(`Seat selected successfully: ${seatRequest.legId}`);
        this.isLoading.set(false);
        this.announcement.success('Seat selected successfully');
      },
      error: (error) => {
        if (error.status === 404) {
          this.announcement.error('Seat not found');
        } else if (error.status === 400) {
          this.announcement.error('Invalid seat selection');
        } else {
          this.announcement.error('Failed to select seat');
        }
        this.isLoading.set(false);
      }
    });
  }

}









