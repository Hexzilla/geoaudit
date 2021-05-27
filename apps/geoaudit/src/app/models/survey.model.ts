import { Job, User } from '.';

export interface Survey {
    abrioxes: [];
    conducted_by: User;
    created_at: string;
    date_assigned: string;
    date_delivery: string;
    footer: any;
    geometry: any;
    id: number;
    reference: string;
    job: Job
    name: string;
    prepared_by: User;
    resistivities: []
    site: any;
    status: any;
    survey_notes: []
    tp_actions: []
    tr_actions: []   
}