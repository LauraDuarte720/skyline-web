import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth';
import { AirlineService } from '../../services/airline';

@Component({
  imports: [RouterLink],
  selector: 'app-airline-panel',
  styleUrl: './airline-panel.css',
  templateUrl: './airline-panel.html',
})
export class AirlinePanel {
  protected auth = inject(AuthService);   // protected: the HTML uses hasRole
  private airlineService = inject(AirlineService);

  // Name of the airline for the title. If it fails, the page works without it.
  private airlineId = this.auth.airlineId();
  airline = toSignal(
    this.airlineId
      ? this.airlineService.getById(this.airlineId).pipe(catchError(() => of(null)))
      : of(null),
    { initialValue: null }
  );
}