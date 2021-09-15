import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { ReferenceCell } from "../models";

@Injectable()
export class ReferenceCellDataService extends DefaultDataService<ReferenceCell> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('ReferenceCell', httpClient, httpUrlGenerator);
    }

    add(event: ReferenceCell): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/reference-cells`, event);
    }

    getAll(): Observable<Array<ReferenceCell>> {
        return this.http.get<any>(`${environment.API_URL}/reference-cells`);
    }
    
    getById(id): Observable<ReferenceCell> {
        return this.http.get<any>(`${environment.API_URL}/reference-cells/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<ReferenceCell>> {
        return this.http.get<any>(`${environment.API_URL}/reference-cells?${queryParams}`);
    }

    update(update: Update<ReferenceCell>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/reference-cells/${update.id}`, update.changes);
    }
}