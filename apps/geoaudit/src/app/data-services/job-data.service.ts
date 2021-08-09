import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
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

    getWithQuery(queryParams: string | QueryParams): Observable<Array<Job>> {
        return this.http.get<any>(`${environment.API_URL}/jobs?${queryParams}`);
    }

    update(update: Update<Job>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/jobs/${update.id}`, update.changes);
    }

    delete(id: number) {
        return this.http.delete<any>(`${environment.API_URL}/jobs/${id}`);
    }
}