import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Tr } from"../models";

@Injectable()
export class TrEntityService extends EntityCollectionServiceBase<Tr> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Tr', serviceElementsFactory);
    }
}