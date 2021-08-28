import { Abriox } from "./abriox.model";
import { GeoJson } from "./geo-json.model";
import { Image } from "./image.model";
import { Note } from "./note.model";
import { Status } from "./status.model";
import { TpAction } from "./tp-action.model";
import { TpType } from "./tp-type.model";
import { User } from "./user.model";

export interface Testpost {
    id? :number;
    tp_actions?: Array<TpAction>;
    abriox?: Abriox;
    reference?: string;
    name?: string;
    date_installation?: string;
    manufacture?: string;
    model?: string;
    serial_number?: string;
    geometry?: any;
    notes?: Array<Note>;
    status?: Status;
    actions?: TpAction;
    tp_type?: TpType;

    images?: Array<Image>;
    documents?: Array<any>;
    comment?: Array<any>;
    approved?: boolean;
    approved_by?: User;
}