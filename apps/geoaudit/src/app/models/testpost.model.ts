import { Abriox } from "./abriox.model";
import { Footer } from "./footer.model";
import { GeoJson } from "./geo-json.model";
import { Note } from "./note.model";
import { Status } from "./status.model";
import { TpAction } from "./tp-action.model";
import { TpType } from "./tp-type.model";

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
    geometry: GeoJson;
    footer?: Array<Footer>;
    notes?: Array<Note>;
    status?: Status;
    actions?: TpAction;
    tp_type?: TpType;
}