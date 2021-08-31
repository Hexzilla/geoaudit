import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { TrAction } from"../models";

@Injectable()
export class TpActionEntityService extends EntityCollectionServiceBase<TrAction> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('TrAction', serviceElementsFactory);
    }
}