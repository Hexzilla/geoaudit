import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { TpAction } from"../models";

@Injectable()
export class TpActionEntityService extends EntityCollectionServiceBase<TpAction> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('TpAction', serviceElementsFactory);
    }
}