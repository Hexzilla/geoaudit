import { Image } from "./image.model";
import { Tr } from "./tr.model";
import { User } from "./user.model";

export interface TrNote {
    date: string;
    description: string;
    user: User;
    image: Image;
    attachment: Image;
    tr: Tr;
}