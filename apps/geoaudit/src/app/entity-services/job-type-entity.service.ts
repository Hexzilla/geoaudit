import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { JobType } from "../models/job-type.model";

@Injectable()
export class JobTypeEntityService extends EntityCollectionServiceBase<JobType> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('JobType', serviceElementsFactory);
    }
}