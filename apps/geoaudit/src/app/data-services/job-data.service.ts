import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Job } from "../models";

@Injectable()
export class JobDataService extends DefaultDataService<Job> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Job', httpClient, httpUrlGenerator);
    }
    
    getById(id): Observable<Job> {
        return this.http.get<any>(`${environment.API_URL}/jobs/${id}`);
    }
}