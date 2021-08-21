import { Abriox } from "./abriox.model";
import { Condition } from "./condition.model";
import { Status } from "./status.model";

export interface AbrioxAction {
    id?: number;
    date: string;
    abriox: Abriox;
    condition: Condition;
    reference: string;
    status: Status;
}