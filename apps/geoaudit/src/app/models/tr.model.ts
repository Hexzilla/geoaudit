import { Abriox } from "./abriox.model";
import { Condition } from "./condition.model";
import { FaultDetail } from "./fault-detail.model";
import { Footer } from "./footer.model";
import { Note } from "./note.model";
import { Status } from "./status.model";

export interface Tr {
    id?:number;
    name?: string;
    abriox?: Abriox;
    footer?: Footer;
    fault_detail?: Array<FaultDetail>;
    serial_number?: string;
    date_installation?: string;
    geometry: object;
    notes?: Array<Note>;
    status?: Status;
    condition?: Condition;
    reference?: string;
}