import { User } from "./user.model";

export interface Notification {
    seen: boolean;
    source: User;
    recipient: User;
    data: object;
}