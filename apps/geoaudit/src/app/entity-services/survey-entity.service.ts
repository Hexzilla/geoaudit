import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Survey } from "../models";

@Injectable()
export class SurveyEntityService extends EntityCollectionServiceBase<Survey> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Survey', serviceElementsFactory);
    }
}