import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Event } from "../models";

@Injectable()
export class EventDataService extends DefaultDataService<Event> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Event', httpClient, httpUrlGenerator);
    }

    add(event: Event): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/calendar-events`, event);
    }

    getAll(): Observable<Array<Event>> {
        return this.http.get<any>(`${environment.API_URL}/calendar-events`);
    }
    
    getById(id): Observable<Event> {
        return this.http.get<any>(`${environment.API_URL}/calendar-events/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<Event>> {
        return this.http.get<any>(`${environment.API_URL}/calendar-events?${queryParams}`);
    }

    update(update: Update<Event>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/calendar-events/${update.id}`, update.changes);
    }
}