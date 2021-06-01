import { Image } from "./image.model";
import { User } from "./user.model";

export interface Footer {
    id: number;
    images: Array<Image>;
    documents: Array<any>;
    comment: Array<any>;
    approved: boolean;
    approved_by: User;
}