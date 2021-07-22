import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import qs from 'qs';
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Notification } from "../models";
import { AuthService } from "../services";

@Injectable()
export class NotificationDataService extends DefaultDataService<Notification> {

    constructor(
        private authService: AuthService,
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Notification', httpClient, httpUrlGenerator);
    }

    add(notification: Notification): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/notifications`, notification);
    }

    getAll(): Observable<Array<Notification>> {
        const parameters = qs.stringify({
            _where: {
                recipient: this.authService.authValue.user.id,
            }
        })

        return this.http.get<any>(`${environment.API_URL}/notifications?${parameters}`);
    }
    
    getById(id): Observable<Notification> {
        return this.http.get<any>(`${environment.API_URL}/notifications/${id}`);
    }

    update(update: Update<Notification>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/notifications/${update.id}`, update.changes);
    }
}