import { Abriox } from "./abriox.model";
import { Condition } from "./condition.model";
import { Footer } from "./footer.model";
import { Status } from "./status.model";
import { TpAction } from "./tp-action.model";
import { TpNote } from "./tp-note.model";
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
    geometry: object;
    footer?: Array<Footer>;
    tp_notes?: Array<TpNote>;
    status?: Status;
    condition?: Condition;
    tp_type?: TpType;
}