import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Survey } from "../models";

@Injectable()
export class SurveyDataService extends DefaultDataService<Survey> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Survey', httpClient, httpUrlGenerator);
    }

    add(survey: Survey): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/surveys`, survey);
    }

    getAll(): Observable<Array<Survey>> {
        return this.http.get<any>(`${environment.API_URL}/surveys`);
    }
    
    getById(id): Observable<Survey> {
        return this.http.get<any>(`${environment.API_URL}/surveys/${id}`);
    }
    
    getWithQuery(queryParams: string | QueryParams): Observable<Array<Survey>> {
        return this.http.get<any>(`${environment.API_URL}/surveys?${queryParams}`);
    }

    update(update: Update<Survey>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/surveys/${update.id}`, update.changes);
    }

    delete(id: number) {
        return this.http.delete<any>(`${environment.API_URL}/surveys/${id}`);
    } 
}