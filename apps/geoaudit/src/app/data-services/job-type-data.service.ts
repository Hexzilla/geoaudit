import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { JobType } from "../models/job-type.model";

@Injectable()
export class JobTypeDataService extends DefaultDataService<JobType> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('JobType', httpClient, httpUrlGenerator);
    }

    getAll(): Observable<Array<JobType>> {
        return this.http.get<any>(`${environment.API_URL}/job-types`);
    }
}