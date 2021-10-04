import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from"rxjs";
import { environment } from"../../environments/environment";
import { Abriox } from"../models";

@Injectable()
export class AbrioxDataService extends DefaultDataService<Abriox> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Abriox', httpClient, httpUrlGenerator);
    }

    add(event: Abriox): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/abrioxes`, event);
    }

    getAll(): Observable<Array<Abriox>> {
        return this.http.get<any>(`${environment.API_URL}/abrioxes`);
    }
    
    getById(id): Observable<Abriox> {
        return this.http.get<any>(`${environment.API_URL}/abrioxes/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<Abriox>> {
        return this.http.get<any>(`${environment.API_URL}/abrioxes?${queryParams}`);
    }

    update(update: Update<Abriox>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/abrioxes/${update.id}`, update.changes);
    }

    delete(id: number) {
        return this.http.delete<any>(`${environment.API_URL}/abrioxes/${id}`);
    }
}