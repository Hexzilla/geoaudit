import { HttpClient } from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory, QueryParams } from '@ngrx/data';
import { environment } from "../../environments/environment";

import { Job } from "../models";

@Injectable()
export class JobEntityService extends EntityCollectionServiceBase<Job> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory,
        private http: HttpClient
    ) {
        super('Job', serviceElementsFactory);
    }

    count(queryParams: string | QueryParams) {
        return this.http.get<any>(`${environment.API_URL}/jobs/count?${queryParams}`);
    }

    CheckedJobRow = new EventEmitter();
}