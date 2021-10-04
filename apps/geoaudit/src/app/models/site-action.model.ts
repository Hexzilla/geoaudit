import { Image } from "./image.model";
import { Status } from "./status.model";
import { User } from "./user.model";

export interface SiteAction {
    id: number;
    name: string;
    date: string;

    survey: number;
    site: number;
    site_status: number;
    status: Status;

    images: Array<Image>;
    documents: Array<any>;
    comment: Array<any>;
    approved: boolean;
    approved_by: User;
}