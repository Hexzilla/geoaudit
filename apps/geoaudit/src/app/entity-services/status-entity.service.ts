import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Status } from "../models";

@Injectable()
export class StatusEntityService extends EntityCollectionServiceBase<Status> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('Status', serviceElementsFactory);
    }
}