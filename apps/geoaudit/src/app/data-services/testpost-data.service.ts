import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from"rxjs";
import { environment } from"../../environments/environment";
import { Testpost } from"../models";

@Injectable()
export class TestpostDataService extends DefaultDataService<Testpost> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Testpost', httpClient, httpUrlGenerator);
    }

    getAll(): Observable<Array<Testpost>> {
        return this.http.get<any>(`${environment.API_URL}/testposts`);
    }

    add(testpost: Testpost): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/testposts`, testpost);
    }
    
    getById(id): Observable<Testpost> {
        return this.http.get<any>(`${environment.API_URL}/testposts/${id}`);
    }

    update(update: Update<Testpost>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/testposts/${update.id}`, update.changes);
    }
}