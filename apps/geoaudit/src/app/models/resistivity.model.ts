import { Footer } from "./footer.model";
import { Note } from "./note.model";
import { Status } from "./status.model";
import { Survey } from "./survey.model";

export interface Resistivity {
    id?:number;
    reference?: string;
    date?: string;
    geometry: object;
    survey?: Survey;
    // resistivity_detail: ResistivityDetail;
    resistivity_detail?: any;
    footer?: Footer;
    notes?: Array<Note>;
    status?: Status;
}