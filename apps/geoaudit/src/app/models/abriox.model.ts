import { AbrioxNote } from "./abriox-note.model";
import { Condition } from "./condition.model";
import { Footer } from "./footer.model";
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
    abriox_notes?: Array<AbrioxNote>;
    status?: Status;
    condition?: Condition;
}