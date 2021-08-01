import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Site } from"../models";

@Injectable()
export class SiteEntityService extends EntityCollectionServiceBase<Site> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Site', serviceElementsFactory);
    }
}