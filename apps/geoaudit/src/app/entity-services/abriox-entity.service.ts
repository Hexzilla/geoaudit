import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Abriox } from"../models";

@Injectable()
export class AbrioxEntityService extends EntityCollectionServiceBase<Abriox> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Abriox', serviceElementsFactory);
    }
}