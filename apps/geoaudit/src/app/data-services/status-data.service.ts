import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Status } from "../models";

@Injectable()
export class StatusDataService extends DefaultDataService<Status> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Status', httpClient, httpUrlGenerator);
    }

    getAll(): Observable<Array<Status>> {
        return this.http.get<any>(`${environment.API_URL}/statuses`);
    }
}