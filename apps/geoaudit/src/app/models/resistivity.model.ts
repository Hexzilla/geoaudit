import { Image } from "./image.model";
import { Note } from "./note.model";
import { Status } from "./status.model";
import { Survey } from "./survey.model";
import { User } from "./user.model";

export interface Resistivity {
    id?:number;
    reference?: string;
    date?: string;
    geometry: object;
    survey?: Survey;
    // resistivity_detail: ResistivityDetail;
    resistivity_detail?: any;
    notes?: Array<Note>;
    status?: Status;

    images?: Array<Image>;
    documents?: Array<any>;
    comment?: Array<any>;
    approved?: boolean;
    approved_by?: User;
}