import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import qs from 'qs';
import { DefaultDataService, HttpUrlGenerator, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Note } from "../models";
import { AuthService } from "../services";

@Injectable()
export class NoteDataService extends DefaultDataService<Note> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator,
        private authService: AuthService
    ) {
        super('Note', httpClient, httpUrlGenerator);
    }

    add(note: Note): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/notes`, note);
    }

    getAll(): Observable<Array<Note>> {
        const parameters = qs.stringify({
            _where: {
                assignees: this.authService.authValue.user.id,
            },
            _sort: 'datetime:DESC'
        })

        return this.http.get<any>(`${environment.API_URL}/notes?${parameters}`);
    }
    
    getById(id): Observable<Note> {
        return this.http.get<any>(`${environment.API_URL}/notes/${id}`);
    }
    
    getWithQuery(queryParams: string | QueryParams): Observable<Array<Note>> {
        return this.http.get<any>(`${environment.API_URL}/notes?${queryParams}`);
    }

    update(update: Update<Note>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/notes/${update.id}`, update.changes);
    }
}