import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { SiteAction } from "../models";

@Injectable()
export class SiteActionDataService extends DefaultDataService<SiteAction> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('SiteAction', httpClient, httpUrlGenerator);
    }

    add(event: SiteAction): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/site-actions`, event);
    }

    getAll(): Observable<Array<SiteAction>> {
        return this.http.get<any>(`${environment.API_URL}/site-actions`);
    }
    
    getById(id): Observable<SiteAction> {
        return this.http.get<any>(`${environment.API_URL}/site-actions/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<SiteAction>> {
        return this.http.get<any>(`${environment.API_URL}/site-actions?${queryParams}`);
    }

    update(update: Update<SiteAction>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/site-actions/${update.id}`, update.changes);
    }

    delete(id: number) {
        return this.http.delete<any>(`${environment.API_URL}/site-actions/${id}`);
    } 
}