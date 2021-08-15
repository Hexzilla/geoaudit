import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Condition } from "../models";

@Injectable()
export class ConditionDataService extends DefaultDataService<Condition> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Condition', httpClient, httpUrlGenerator);
    }

    add(event: Condition): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/conditions`, event);
    }

    getAll(): Observable<Array<Condition>> {
        return this.http.get<any>(`${environment.API_URL}/conditions`);
    }
    
    getById(id): Observable<Condition> {
        return this.http.get<any>(`${environment.API_URL}/conditions/${id}`);
    }

    getWithQuery(queryParams: string | QueryParams): Observable<Array<Condition>> {
        return this.http.get<any>(`${environment.API_URL}/conditions?${queryParams}`);
    }

    update(update: Update<Condition>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/conditions/${update.id}`, update.changes);
    }
}