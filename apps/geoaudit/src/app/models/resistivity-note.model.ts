import { Image } from "./image.model";
import { Resistivity } from "./resistivity.model";
import { User } from "./user.model";

export interface ResistivityNote {
    date: string;
    description: string;
    user: User;
    image: Image;
    attachment: Image;
    resistivity: Resistivity;
}