import { Image } from "./image.model";
import { Note } from "./note.model";
import { SiteDetail } from "./site-detail.model";
import { SiteStatus } from "./site-status.model";
import { SiteType } from "./site-type.model";
import { Status } from "./status.model";
import { Survey } from "./survey.model";
import { User } from "./user.model";

export interface Site {
    site_detail: SiteDetail;
    reference: string;
    name: string;
    date_installation: string;
    survey: Survey;
    notes: Array<Note>;
    status: Status;
    site_type: SiteType;
    site_status: SiteStatus;

    images: Array<Image>;
    documents: Array<any>;
    comment: Array<any>;
    approved: boolean;
    approved_by: User;
}