import { AbrioxAction } from "./abriox-action.model";
import { Condition } from "./condition.model";
import { Footer } from "./footer.model";
import { Note } from "./note.model";
import { Status } from "./status.model";
import { Survey } from "./survey.model";
import { Testpost } from "./testpost.model";
import { Tr } from "./tr.model";

export interface Abriox {
    id? :number;
    name?: string;
    telephone?: number;
    serial_number?: string;
    date_installation?: string;
    footer?: Footer;
    tr?: Tr;
    testpost: Testpost;
    surveys?: Array<Survey>;
    status?: Status;
    condition?: Condition;
    notes?: Array<Note>;
    abriox_actions?: Array<AbrioxAction>;
}