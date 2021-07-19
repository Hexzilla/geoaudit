import { Survey } from "./survey.model";
import { User } from "./user.model";

export interface CalendarEvent {
    id: number;
    title?: string;
    start?: string;
    end?: string;
    allDay?: boolean;
    notes?: string;
    surveys?: Array<Survey>;
    users_permissions_users?: Array<User>;
    published?: boolean;
    uuid?: string;
    uid?: string;
    created_by?: string;
    updated_by?: string;
}