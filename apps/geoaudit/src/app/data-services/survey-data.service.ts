import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
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
    
    getById(id): Observable<Survey> {
        return this.http.get<any>(`${environment.API_URL}/surveys/${id}`);
    }

    update(update: Update<Survey>): Observable<any> {
        console.log('update', update)
        return this.http.put<any>(`${environment.API_URL}/surveys/${update.id}`, update.changes);
    }
}