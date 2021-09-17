import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { TpAction } from "../models";

@Injectable()
export class TpActionDataService extends DefaultDataService<TpAction> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('TPAction', httpClient, httpUrlGenerator);
    }

    add(event: TpAction): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/tp-actions`, event);
    }

    getAll(): Observable<Array<TpAction>> {
        return this.http.get<any>(`${environment.API_URL}/tp-actions`);
    }
    
    getById(id): Observable<TpAction> {
        return this.http.get<any>(`${environment.API_URL}/tp-actions/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<TpAction>> {
        return this.http.get<any>(`${environment.API_URL}/tp-actions?${queryParams}`);
    }

    update(update: Update<TpAction>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/tp-actions/${update.id}`, update.changes);
    }

    delete(id: number) {
        return this.http.delete<any>(`${environment.API_URL}/tp-actions/${id}`);
    }
}