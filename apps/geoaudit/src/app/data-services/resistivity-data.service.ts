import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from"rxjs";
import { environment } from"../../environments/environment";
import { Resistivity } from"../models";

@Injectable()
export class ResistivityDataService extends DefaultDataService<Resistivity> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Resistivity', httpClient, httpUrlGenerator);
    }

    getAll(): Observable<Array<Resistivity>> {
        return this.http.get<any>(`${environment.API_URL}/resistivities`);
    }

    add(resistivity: Resistivity): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/resistivities`, resistivity);
    }
    
    getById(id): Observable<Resistivity> {
        return this.http.get<any>(`${environment.API_URL}/resistivities/${id}`);
    }

    update(update: Update<Resistivity>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/resistivities/${update.id}`, update.changes);
    }
}