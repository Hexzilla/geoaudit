import { JobType } from "./job-type.model";
import { Status } from "./status.model";

export interface Job {
    created_at: string;
    footer: any;
    id: number;
    reference: string;
    job_type: JobType;
    name: string;
    status: Status;
    updated_at: any;
}