import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DefaultDataService, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import * as moment from "moment";
import qs from 'qs';
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Statuses, Survey } from "../models";
import { AuthService } from "../services";

@Injectable()
export class ToDoListDataService extends DefaultDataService<Survey> {

    constructor(
        httpClient: HttpClient,
        httpUrlGenerator: HttpUrlGenerator,
        private authService: AuthService,
    ) {
        super('ToDoList', httpClient, httpUrlGenerator);
    }

    getAll(): Observable<Array<Survey>> {
        const parameters = qs.stringify({
            _sort: 'date_delivery:asc',
            _where: {
                'job.assignees': this.authService.authValue.user.id,
                'date_delivery_lte': moment().add(14, 'days').toISOString(),
                _or: [
                  { 'status.name': Statuses.NOT_STARTED },
                  { 'status.name': Statuses.ONGOING },
                ],
              },
        })
        return this.http.get<any>(`${environment.API_URL}/surveys?${parameters}`);
    }
}