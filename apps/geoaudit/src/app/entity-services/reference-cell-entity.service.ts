import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { ReferenceCell } from "../models";

@Injectable()
export class ReferenceCellEntityService extends EntityCollectionServiceBase<ReferenceCell> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('ReferenceCell', serviceElementsFactory);
    }
}