import { JobType } from "./job-type";
import { Status } from "./status";

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