import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { TrAction } from "../models";

@Injectable()
export class TrActionDataService extends DefaultDataService<TrAction> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('TRAction', httpClient, httpUrlGenerator);
    }

    add(event: TrAction): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/tr-actions`, event);
    }

    getAll(): Observable<Array<TrAction>> {
        return this.http.get<any>(`${environment.API_URL}/tr-actions`);
    }
    
    getById(id): Observable<TrAction> {
        return this.http.get<any>(`${environment.API_URL}/tr-actions/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<TrAction>> {
        return this.http.get<any>(`${environment.API_URL}/tr-actions?${queryParams}`);
    }

    update(update: Update<TrAction>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/tr-actions/${update.id}`, update.changes);
    }
}