import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models';

@Injectable()
export class NotificationService {
  constructor(private http: HttpClient) {}

  post(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(
      `${environment.API_URL}/notifications`,
      notification
    );
  }
}
