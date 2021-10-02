import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { FaultType } from "../models";

@Injectable()
export class FaultTypeDataService extends DefaultDataService<FaultType> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('FaultType', httpClient, httpUrlGenerator);
    }

    add(event: FaultType): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/fault-types`, event);
    }

    getAll(): Observable<Array<FaultType>> {
        return this.http.get<any>(`${environment.API_URL}/fault-types`);
    }
    
    getById(id): Observable<FaultType> {
        return this.http.get<any>(`${environment.API_URL}/fault-types/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<FaultType>> {
        return this.http.get<any>(`${environment.API_URL}/fault-types?${queryParams}`);
    }

    update(update: Update<FaultType>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/fault-types/${update.id}`, update.changes);
    }
}