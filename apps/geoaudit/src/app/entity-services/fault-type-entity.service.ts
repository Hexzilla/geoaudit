import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { FaultType } from "../models";

@Injectable()
export class FaultTypeEntityService extends EntityCollectionServiceBase<FaultType> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('FaultType', serviceElementsFactory);
    }
}