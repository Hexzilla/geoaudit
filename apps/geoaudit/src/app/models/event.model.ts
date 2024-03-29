import { Job } from "./job.model";
import { Survey } from "./survey.model";
import { User } from "./user.model";

export interface Event {
    id: number;
    title?: string;
    start?: string;
    end?: string;
    allDay?: boolean;
    notes?: string;
    surveys?: Array<Survey>;
    jobs?: Array<Job>;
    users_permissions_users?: Array<User>;
    published?: boolean;
    uuid?: string;
    uid?: string;
    created_by?: string;
    updated_by?: string;
}