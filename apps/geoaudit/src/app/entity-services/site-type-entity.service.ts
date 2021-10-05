import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { SiteType } from "../models";

@Injectable()
export class SiteTypeEntityService extends EntityCollectionServiceBase<SiteType> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('SiteType', serviceElementsFactory);
    }
}