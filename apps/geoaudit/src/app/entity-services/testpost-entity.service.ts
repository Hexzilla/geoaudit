import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Testpost } from"../models";

@Injectable()
export class TestpostEntityService extends EntityCollectionServiceBase<Testpost> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Testpost', serviceElementsFactory);
    }
}