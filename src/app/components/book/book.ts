import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking';
import { SelectOutboundFlightRequest, SelectReturnFlightRequest, BookingResponse} from '../../flights/booking';
import { TripType } from '../../flights/booking';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-book',
  styleUrl: './book.css',
  templateUrl: './book.html',
})
export class Book {

  private bookingService = inject(BookingService);
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
     const booking = this.bookingForm.value as SelectOutboundFlightRequest;

     this.isLoading.set(true);

     this.bookingService.create(booking).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => {
            this.result.set(`Outbound flight selectetd correctly: ${response.id}, ${response.bookingStatus}` );
            this.bookingForm.reset();
            this.isLoading.set(false);
        },
        error: (error) => {
            if (error.status === 404) {
                this.result.set('Outbound flight not found: ');
            } else if (error.status === 400) {
                this.result.set('Error creating booking:');

            }else {
                this.result.set('Try again');
            }
            this.isLoading.set(false);
        }
    });
}}
