import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Hazard } from"../models";

@Injectable()
export class HazardEntityService extends EntityCollectionServiceBase<Hazard> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Hazard', serviceElementsFactory);
    }
}