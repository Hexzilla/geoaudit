import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Hazard } from "../models";

@Injectable()
export class HazardDataService extends DefaultDataService<Hazard> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Hazard', httpClient, httpUrlGenerator);
    }

    add(hazard: Hazard): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/hazards`, hazard);
    }

    getAll(): Observable<Array<Hazard>> {
        return this.http.get<any>(`${environment.API_URL}/hazards`);
    }
    
    getById(id): Observable<Hazard> {
        return this.http.get<any>(`${environment.API_URL}/hazards/${id}`);
    }

    update(update: Update<Hazard>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/hazards/${update.id}`, update.changes);
    }

    delete(id: number) {
        return this.http.delete<any>(`${environment.API_URL}/hazards/${id}`);
    } 
}