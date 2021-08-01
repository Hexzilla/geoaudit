import { Footer } from './footer.model';
import { JobType } from "./job-type.model";
import { Note } from './note.model';
import { Status } from "./status.model";
import { Survey } from "./survey.model";
import { User } from "./user.model";

export interface Job {
    created_at: string;
    footer: Footer;
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
}