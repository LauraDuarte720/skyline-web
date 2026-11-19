import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { TopAirline } from '../../flights/airline';
import { AirlineService } from '../../services/airline';
import { NotificationsService } from '../../services/notifications';

@Component({
  imports: [RouterLink],
  selector: 'app-admin-panel',
  styleUrl: './admin-panel.css',
  templateUrl: './admin-panel.html',
})
export class AdminPanel {
  private announcement = inject(NotificationsService);

  readonly limit = 5;

  // Ranking of the airlines with the most aircraft. null while it loads, [] if it fails.
  topAirlines = toSignal<TopAirline[] | null>(
    inject(AirlineService).getTop(this.limit).pipe(
      catchError(() => {
        this.announcement.error('No pudimos cargar el ranking de aerolíneas.');
        return of([] as TopAirline[]);
      })
    ),
    { initialValue: null }
  );
}