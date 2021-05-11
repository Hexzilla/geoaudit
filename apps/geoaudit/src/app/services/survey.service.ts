import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Parameters } from "../models";

@Injectable({ providedIn: 'root' })
export class SurveyService {

    constructor(
        private http: HttpClient
    ) {}

    count() {
        return this.http.get<any>(`${environment.API_URL}/surveys/count`);
    }

    getSurveys(parameters: Parameters) {
        console.log('get surveys', parameters)
        return this.http.get<any>(`${environment.API_URL}/surveys?_start=${parameters.start}&_limit=${parameters.limit}`);
    }
}