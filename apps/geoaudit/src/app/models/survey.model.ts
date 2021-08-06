import { Job, User } from '.';
import { Footer } from './footer.model';
import { Note } from './note.model';

export interface Survey {
    abrioxes?: [];
    conducted_by?: User;
    created_at?: string;
    date_assigned?: string;
    date_delivery?: string;
    footer?: Footer;
    geometry: any;
    id?: number;
    reference?: string;
    job?: Job
    name?: string;
    prepared_by?: User;
    resistivities?: []
    site?: any;
    status?: any;
    notes?: Array<Note>;
    tp_actions?: []
    tr_actions?: []   
}