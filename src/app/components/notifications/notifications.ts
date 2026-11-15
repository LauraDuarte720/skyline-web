import { Component, inject } from '@angular/core';
import{ NotificationsService } from '../../services/notifications';

@Component({
  imports: [],
  selector: 'app-notifications',
  styleUrl: './notifications.css',
  templateUrl: './notifications.html',
})
export class Notifications {

  service = inject(NotificationsService);
}
