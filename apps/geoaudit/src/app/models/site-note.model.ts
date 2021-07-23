import { Image } from "./image.model";
import { Site } from "./site.model";
import { User } from "./user.model";

export interface SiteNote {
    date: string;
    description: string;
    image: Image;
    attachment: Image;
    user: User;
    site: Site;
}