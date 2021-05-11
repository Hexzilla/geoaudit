import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import qs from 'qs';
import { environment } from "../../environments/environment";
import { Parameters } from "../models";
import { statuses } from "../models/status";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class SurveyService {

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    count() {
        return this.http.get<any>(`${environment.API_URL}/surveys/count`);
    }

    getSurveys(parameters: Parameters) {
        /**
         * Default query parameters
         * 
         * For pagination defining
         * where the results should start from and to what limit i.e.
         * how many results do we want to fetch.
         * 
         * For user defining what user we should fetch surveys for.
         */
        const pagination = qs.stringify({
            _start: parameters.start,
            _limit: parameters.limit,
            _where: {
                conducted_by: this.authService.authValue.user.id,
                _or: [ { "status.name": statuses.NOT_STARTED }, { "status.name": statuses.ONGOING }]
            }
        });

        if (parameters.filter) {
            /**
             * The query here is a where condition performed on the postgres database by strapi
             * on the application server. Here we're specifying an OR condition such that the filter can be
             * applied to the id_reference containing or stauts name containing.
             * 
             * Please see https://strapi.io/documentation/developer-docs/latest/developer-resources/content-api/content-api.html#filters
             */
            const query = qs.stringify({ _where: { _or: [ { id_reference_contains: parameters.filter }, { "status.name_contains": parameters.filter } ] } });
            return this.http.get<any>(`${environment.API_URL}/surveys?${pagination}&${query}`);
        } else {
            return this.http.get<any>(`${environment.API_URL}/surveys?${pagination}`);
        }
    }
}