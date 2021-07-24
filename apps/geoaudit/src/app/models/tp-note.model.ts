import { Image } from "./image.model";
import { Testpost } from "./testpost.model";
import { User } from "./user.model";

export interface TpNote {
    date: string;
    description: string;
    user: User;
    image: Image;
    attachment: Image;
    testpost: Testpost;
}