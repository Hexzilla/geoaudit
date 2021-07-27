import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { User } from "../models";

@Injectable()
export class UserDataService extends DefaultDataService<User> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('User', httpClient, httpUrlGenerator);
    }

    getAll(): Observable<Array<User>> {
        return this.http.get<any>(`${environment.API_URL}/users`);
    }

    getById(id): Observable<User> {
        return this.http.get<any>(`${environment.API_URL}/users/${id}`);
    }

    update(update: Update<User>): Observable<User> {
        return this.http.put<any>(`${environment.API_URL}/users/${update.id}`, update.changes);
    }
}