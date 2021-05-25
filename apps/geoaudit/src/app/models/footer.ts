import { User } from "./user";

export interface Footer {
    image: any;
    attachment: any;
    comment: any;
    approved: boolean;
    approved_by: User;
}