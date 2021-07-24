import { Abriox } from "./abriox.model";
import { Image } from "./image.model";
import { User } from "./user.model";

export interface AbrioxNote {
    date: string;
    description: string;
    user: User;
    image: Image;
    attachment: Image;
    abriox: Abriox;
}