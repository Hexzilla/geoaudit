import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { AbrioxAction } from "../models";

@Injectable()
export class AbrioxActionDataService extends DefaultDataService<AbrioxAction> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('AbrioxAction', httpClient, httpUrlGenerator);
    }

    add(event: AbrioxAction): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/abriox-actions`, event);
    }

    getAll(): Observable<Array<AbrioxAction>> {
        return this.http.get<any>(`${environment.API_URL}/abriox-actions`);
    }
    
    getById(id): Observable<AbrioxAction> {
        return this.http.get<any>(`${environment.API_URL}/abriox-actions/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<AbrioxAction>> {
        return this.http.get<any>(`${environment.API_URL}/abriox-actions?${queryParams}`);
    }

    update(update: Update<AbrioxAction>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/abriox-actions/${update.id}`, update.changes);
    }

    delete(id: number) {
        return this.http.delete<any>(`${environment.API_URL}/abriox-actions/${id}`);
    }
}