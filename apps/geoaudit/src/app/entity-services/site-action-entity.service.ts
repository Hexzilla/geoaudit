import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { SiteAction } from"../models";

@Injectable()
export class SiteActionEntityService extends EntityCollectionServiceBase<SiteAction> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('SiteAction', serviceElementsFactory);
    }
}