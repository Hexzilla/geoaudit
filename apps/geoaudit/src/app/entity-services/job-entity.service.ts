import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Job } from "../models";

@Injectable()
export class JobEntityService extends EntityCollectionServiceBase<Job> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Job', serviceElementsFactory);
    }
}