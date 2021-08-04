import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
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

    getAll(): Observable<Array<Abriox>> {
        return this.http.get<any>(`${environment.API_URL}/abrioxes`);
    }

    add(abriox: Abriox): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/abrioxes`, abriox);
    }
    
    getById(id): Observable<Abriox> {
        return this.http.get<any>(`${environment.API_URL}/abrioxes/${id}`);
    }

    update(update: Update<Abriox>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/abrioxes/${update.id}`, update.changes);
    }
}