import { Footer } from "./footer.model";
import { ResistivityDetail } from "./resistivity-detail.model";
import { ResistivityNote } from "./resistivity-note.model";
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
    resistivity_notes?: Array<ResistivityNote>;
    status?: Status;
}