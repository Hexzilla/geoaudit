import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Site } from "../models";

@Injectable()
export class SiteDataService extends DefaultDataService<Site> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Site', httpClient, httpUrlGenerator);
    }

    add(site: Site): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/sites`, site);
    }

    getAll(): Observable<Array<Site>> {
        return this.http.get<any>(`${environment.API_URL}/sites`);
    }
    
    getById(id): Observable<Site> {
        return this.http.get<any>(`${environment.API_URL}/sites/${id}`);
    }

    update(update: Update<Site>): Observable<any> {
        console.log('update', update)
        return this.http.put<any>(`${environment.API_URL}/sites/${update.id}`, update.changes);
    }

    delete(id: number) {
        return this.http.delete<any>(`${environment.API_URL}/sites/${id}`);
    } 
}