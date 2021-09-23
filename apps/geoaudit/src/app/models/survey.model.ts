import { Job, User } from '.';
import { Image } from './image.model';
import { Note } from './note.model';

export interface Survey {
    abrioxes?: [];
    conducted_by?: User;
    created_at?: string;
    date_assigned?: string;
    date_delivery?: string;
    geometry: any;
    id?: number;
    reference?: string;
    job?: Job
    name?: string;
    prepared_by?: User;
    resistivities?: Array<any>;
    site?: any;
    status?: any;
    notes?: Array<Note>;
    tp_actions?: Array<any>;
    tr_actions?: Array<any>;
    abriox_actions?: Array<any>;

    site_action_list_completed?: boolean;
    testpost_action_list_completed?: boolean;
    tr_action_list_completed?: boolean;
    abriox_action_list_completed?: boolean;
    resistivity_action_list_completed?: boolean;

    images?: Array<Image>;
    documents?: Array<any>;
    comment?: Array<any>;
    approved?: boolean;
    approved_by?: User;
}