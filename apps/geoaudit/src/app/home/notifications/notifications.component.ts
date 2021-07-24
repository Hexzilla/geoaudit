import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationEntityService } from '../../entity-services/notification-entity.service';
import { Notification } from '../../models';

@Component({
  selector: 'geoaudit-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<Array<Notification>> = this
    .notificationEntityService.entities$;

  constructor(private notificationEntityService: NotificationEntityService) {}

  ngOnInit(): void {
    this.notificationEntityService.getAll();
  }

  dismiss(notification: Notification) {
    this.notificationEntityService.update({
      ...notification,
      seen: true,
    });
  }
}
