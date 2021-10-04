import { Abriox } from "./abriox.model";
import { Condition } from "./condition.model";
import { Image } from "./image.model";
import { Status } from "./status.model";
import { Survey } from "./survey.model";
import { User } from "./user.model";

export interface AbrioxAction {
    id?: number;
    date: string;
    abriox: Abriox;
    condition: Condition;
    reference: string;
    status: Status;
    survey: Survey;

    images?: Array<Image>;
    documents?: Array<any>;
    comment?: Array<any>;
    approved?: boolean;
    approved_by?: User;
}