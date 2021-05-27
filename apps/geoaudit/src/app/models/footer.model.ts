import { User } from "./user.model";

export interface Footer {
    id: number;
    image: Array<any>;
    attachment: any;
    comment: Array<any>;
    approved: boolean;
    approved_by: User;
}