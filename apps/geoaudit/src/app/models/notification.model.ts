import { User } from "./user.model";

export interface NOTIFICATION_DATA {
    type: 'SHARE_JOB',
    subject: any,
    message: string
}

export interface Notification {
    seen?: boolean;
    source: User;
    recipient: User;
    data: NOTIFICATION_DATA;
}