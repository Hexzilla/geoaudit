import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory, QueryParams } from '@ngrx/data';
import { environment } from "../../environments/environment";

import { Survey } from "../models";

@Injectable()
export class SurveyEntityService extends EntityCollectionServiceBase<Survey> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory,
        private http: HttpClient
    ) {
        super('Survey', serviceElementsFactory);
    }    

    count(queryParams: string | QueryParams) {
        return this.http.get<any>(`${environment.API_URL}/surveys/count?${queryParams}`);
    }
}