import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class SurveyService {

    constructor(
        private http: HttpClient
    ) {}

    getSurveys() {
        return this.http.get<any>(`${environment.API_URL}/surveys?_limit=10`)
    }
}