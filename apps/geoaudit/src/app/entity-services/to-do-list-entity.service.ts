import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from "rxjs";
import qs from 'qs';
import { environment } from "../../environments/environment";

import { Statuses, Survey } from "../models";
import { AuthService } from "../services";
import * as moment from "moment";

@Injectable()
export class ToDoListEntityService extends EntityCollectionServiceBase<Survey> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory,
        private http: HttpClient,
        private authService: AuthService
    ) {
        super('ToDoList', serviceElementsFactory);
    }

    getToDoList(): Observable<Array<Survey>> {
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