import { Image } from "./image.model";
import { JobType } from "./job-type.model";
import { Note } from './note.model';
import { Status } from "./status.model";
import { Survey } from "./survey.model";
import { User } from "./user.model";

export interface Job {
    created_at: string;
    id: number;
    reference: string;
    job_type: JobType;
    name: string;
    status: Status;
    assignees: Array<User>;
    notes: Array<Note>;
    surveys: Array<Survey>;
    updated_at: any;
    published: boolean;
    archived: boolean;
    
    images: Array<Image>;
    documents: Array<any>;
    comment: Array<any>;
    approved: boolean;
    approved_by: User;
}