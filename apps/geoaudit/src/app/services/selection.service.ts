import { EventEmitter, Injectable } from "@angular/core";
import { Survey } from "../models/survey.model";

@Injectable({ providedIn: 'root' })
export class SelectionService {

    public jobSelectionChangedEvent: EventEmitter<any[]> = new EventEmitter();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}


}