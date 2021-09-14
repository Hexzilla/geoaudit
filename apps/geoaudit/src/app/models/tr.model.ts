import { Abriox } from "./abriox.model";
import { FaultDetail } from "./fault-detail.model";
import { Image } from "./image.model";
import { Note } from "./note.model";
import { Status } from "./status.model";
import { TpAction } from "./tp-action.model";
import { TrAction } from "./tr-action.model";
import { User } from "./user.model";

export interface Tr {
    id?:number;
    name?: string;
    abriox?: Abriox;
    fault_detail?: Array<FaultDetail>;
    serial_number?: string;
    date_installation?: string;
    geometry: object;
    notes?: Array<Note>;
    status?: Status;
    actions?: TpAction;
    reference?: string;
    tr_actions?: Array<TrAction>;

    images?: Array<Image>;
    documents?: Array<any>;
    comment?: Array<any>;
    approved?: boolean;
    approved_by?: User;
}