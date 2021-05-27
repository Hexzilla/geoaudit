import { Job } from "./job.model";
import { User } from "./user.model";

export interface JobNote {
    date: string;
    description: string;
    image: Array<any>;
    attachment: Array<any>;
    user: User;
    job: Job;
}