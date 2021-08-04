import { Injectable } from "@angular/core";
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { CalendarEvent } from "../models";

@Injectable()
export class CalendarEventEntityService extends EntityCollectionServiceBase<CalendarEvent> {

    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory
    ) {
        super('CalendarEvent', serviceElementsFactory);
    }
}