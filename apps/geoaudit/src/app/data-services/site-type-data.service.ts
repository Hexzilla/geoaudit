import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { SiteType } from "../models";

@Injectable()
export class SiteTypeDataService extends DefaultDataService<SiteType> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('SiteType', httpClient, httpUrlGenerator);
    }

    add(event: SiteType): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/site-types`, event);
    }

    getAll(): Observable<Array<SiteType>> {
        return this.http.get<any>(`${environment.API_URL}/site-types`);
    }
    
    getById(id): Observable<SiteType> {
        return this.http.get<any>(`${environment.API_URL}/site-types/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<SiteType>> {
        return this.http.get<any>(`${environment.API_URL}/site-types?${queryParams}`);
    }

    update(update: Update<SiteType>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/site-types/${update.id}`, update.changes);
    }
}