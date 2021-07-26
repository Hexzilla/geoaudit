import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Resistivity } from"../models";

@Injectable()
export class ResistivityEntityService extends EntityCollectionServiceBase<Resistivity> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Resistivity', serviceElementsFactory);
    }
}