import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { AbrioxAction } from"../models";

@Injectable()
export class AbrioxActionEntityService extends EntityCollectionServiceBase<AbrioxAction> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('AbrioxAction', serviceElementsFactory);
    }
}