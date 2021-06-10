import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
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

    add(job: Job): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/jobs`, job);
    }

    getAll(): Observable<Array<Job>> {
        return this.http.get<any>(`${environment.API_URL}/jobs`);
    }
    
    getById(id): Observable<Job> {
        return this.http.get<any>(`${environment.API_URL}/jobs/${id}`);
    }

    update(update: Update<Job>): Observable<any> {
        console.log('update', update)
        return this.http.put<any>(`${environment.API_URL}/jobs/${update.id}`, update.changes);
    }
}