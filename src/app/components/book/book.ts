import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking';
import { SelectOutboundFlightRequest, SelectReturnFlightRequest, BookingResponse} from '../../flights/booking';
import { TripType } from '../../flights/booking';
import { NotificationsService } from '../../services/notifications';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-book',
  styleUrl: './book.css',
  templateUrl: './book.html',
})
export class Book {

  private bookingService = inject(BookingService);
  private announcement = inject(NotificationsService)
  private destroyRef = inject(DestroyRef);

  result = signal('');
  isLoading = signal(false);

  bookingForm = inject(FormBuilder).group ({
        outboundFlightId: ['', [Validators.required]],
        numPassengers: [1, [Validators.required]],
        tripType: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.bookingForm.invalid)return;
    this.result.set('');  
     const booking = this.bookingForm.value as SelectOutboundFlightRequest;

     this.isLoading.set(true);

     this.bookingService.create(booking).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => {
            const message = `Outbound flight selectetd correctly: ${response.id}, ${response.bookingStatus} `
            this.result.set(message);
            this.announcement.success(message)
            this.bookingForm.reset();
            this.isLoading.set(false);
        },
        error: (error) => {
            if (error.status === 404) {
                this.announcement.error('Outbound flight not found: ');
            } else if (error.status === 400) {
                this.announcement.error('Error creating booking:');

            }else {
                this.announcement.error('Try again');
            }
            this.isLoading.set(false);
        }
    });
}}
