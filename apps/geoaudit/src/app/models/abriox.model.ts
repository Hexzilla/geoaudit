import { Condition } from "./condition.model";
import { Footer } from "./footer.model";
import { Note } from "./note.model";
import { Status } from "./status.model";
import { Survey } from "./survey.model";
import { Testpost } from "./testpost.model";

export interface Abriox {
    id? :number;
    name?: string;
    telephone?: number;
    serial_number?: string;
    date_installation?: string;
    footer?: Footer;
    tr?: TrackEvent;
    testpost: Testpost;
    surveys?: Array<Survey>;
    status?: Status;
    condition?: Condition;
    notes?: Array<Note>;
}