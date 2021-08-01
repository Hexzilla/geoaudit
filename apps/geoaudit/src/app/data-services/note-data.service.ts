import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Note } from "../models";

@Injectable()
export class NoteDataService extends DefaultDataService<Note> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator
    ) {
        super('Note', httpClient, httpUrlGenerator);
    }

    add(note: Note): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/notes`, note);
    }

    getAll(): Observable<Array<Note>> {
        return this.http.get<any>(`${environment.API_URL}/notes`);
    }
    
    getById(id): Observable<Note> {
        return this.http.get<any>(`${environment.API_URL}/notes/${id}`);
    }

    update(update: Update<Note>): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/notes/${update.id}`, update.changes);
    }
}