import { Component, OnInit } from '@angular/core';
import { NotificationEntityService } from '../../entity-services/notification-entity.service';

@Component({
  selector: 'geoaudit-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  constructor(
    private notificationEntityService: NotificationEntityService
  ) { }

  ngOnInit(): void {

    this.notificationEntityService.getAll().subscribe(
      (notifications) => {
        console.log('notifications', notifications)
      },

      (err) => {}
    )
  }

}
