import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import qs from 'qs';
import { environment } from "../../environments/environment";
import { Parameters } from "../models";
import { CalendarEvent } from "../models";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class CalendarEventService {

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    count(parameters: Parameters) {
        const pagination = this.getDefaultQs(parameters);

        return this.http.get<any>(`${environment.API_URL}/calendar-events/count?${pagination}`);
    }

    getCalendarEvent(id: number) {
        return this.http.get<any>(`${environment.API_URL}/calendar-events/${id}`);
    }

    getCalendarEvents(parameters: Parameters) {
        const pagination = this.getDefaultQs(parameters);
        return this.http.get<any>(`${environment.API_URL}/calendar-events?${pagination}`);
    }

    createCalendarEvent(calendarEvent: CalendarEvent) {        
        return this.http.post<any>(`${environment.API_URL}/calendar-events`, {
            ...calendarEvent,
            users_permissions_users: [this.authService.authValue.user.id],
            published: false
        });
    }

    putCalendarEvent(calendarEvent: CalendarEvent) {        
        return this.http.put<any>(`${environment.API_URL}/calendar-events/${calendarEvent.id}`, {
            ...calendarEvent,
            users_permissions_users: [calendarEvent.users_permissions_users, this.authService.authValue.user.id]
        });
    }

    delete(calendarEvent: CalendarEvent) {
        return this.http.delete<any>(`${environment.API_URL}/calendar-events/${calendarEvent.id}`);
    }

    /**
     * Default query parameters
     * 
     * For pagination defining
     * where the results should start from and to what limit i.e.
     * how many results do we want to fetch.
     * 
     * For user defining what user we should fetch calendar-events for.
     */
    getDefaultQs(parameters: Parameters): any {
        return qs.stringify({
            _start: parameters.start,
            _limit: parameters.limit,
            _sort: "start:asc",
            _where: {
                users_permissions_users: this.authService.authValue.user.id
            }
        });
    }
}