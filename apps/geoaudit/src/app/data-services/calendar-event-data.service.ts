import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { CalendarEvent } from "../models";

@Injectable()
export class CalendarEventDataService extends DefaultDataService<CalendarEvent> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('CalendarEvent', httpClient, httpUrlGenerator);
    }

    add(calendarEvent: CalendarEvent): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/calendar-events`, calendarEvent);
    }

    getAll(): Observable<Array<CalendarEvent>> {
        return this.http.get<any>(`${environment.API_URL}/calendar-events`);
    }
    
    getById(id): Observable<CalendarEvent> {
        return this.http.get<any>(`${environment.API_URL}/calendar-events/${id}`);
    }

    update(update: Update<CalendarEvent>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/calendar-events/${update.id}`, update.changes);
    }
}