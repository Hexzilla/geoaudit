import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory, QueryParams } from '@ngrx/data';
import { environment } from "../../environments/environment";

import { Job } from "../models";

@Injectable()
export class MyJobEntityService extends EntityCollectionServiceBase<Job> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory,
        private http: HttpClient
    ) {
        super('MyJob', serviceElementsFactory);
    }

    count(queryParams: string | QueryParams) {
        return this.http.get<any>(`${environment.API_URL}/jobs/count?${queryParams}`);
    }
}