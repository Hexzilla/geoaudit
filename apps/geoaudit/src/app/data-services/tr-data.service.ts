import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from"rxjs";
import { environment } from"../../environments/environment";
import { Tr } from"../models";

@Injectable()
export class TrDataService extends DefaultDataService<Tr> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Tr', httpClient, httpUrlGenerator);
    }

    getAll(): Observable<Array<Tr>> {
        return this.http.get<any>(`${environment.API_URL}/trs`);
    }

    add(tr: Tr): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/trs`, tr);
    }
    
    getById(id): Observable<Tr> {
        return this.http.get<any>(`${environment.API_URL}/trs/${id}`);
    }

    update(update: Update<Tr>): Observable<any> {
        console.log('update', update)
        return this.http.put<any>(`${environment.API_URL}/trs/${update.id}`, update.changes);
    }
}