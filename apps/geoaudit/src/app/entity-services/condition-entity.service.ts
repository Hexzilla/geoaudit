import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Condition } from "../models";

@Injectable()
export class ConditionEntityService extends EntityCollectionServiceBase<Condition> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Condition', serviceElementsFactory);
    }
}