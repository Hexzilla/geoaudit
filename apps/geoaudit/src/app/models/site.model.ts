import { Footer } from "./footer.model";
import { Note } from "./note.model";
import { SiteDetail } from "./site-detail.model";
import { SiteStatus } from "./site-status.model";
import { SiteType } from "./site-type.model";
import { Status } from "./status.model";
import { Survey } from "./survey.model";

export interface Site {
    site_detail: SiteDetail;
    reference: string;
    name: string;
    date_installation: string;
    footer: Footer;
    survey: Survey;
    notes: Array<Note>;
    status: Status;
    site_type: SiteType;
    site_status: SiteStatus;
}