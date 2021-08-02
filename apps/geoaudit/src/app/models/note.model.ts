import { Abriox } from "./abriox.model";
import { Image } from "./image.model";
import { Job } from "./job.model";
import { Resistivity } from "./resistivity.model";
import { Site } from "./site.model";
import { Survey } from "./survey.model";
import { Testpost } from "./testpost.model";
import { Tr } from "./tr.model";
import { User } from "./user.model";

export interface Note {
    id?: number;
    datetime: string;
    description: string;
    images: Array<Image>;
    attachments: Array<Image>;
    
    assignees: Array<User>;

    abrioxes: Array<Abriox>;
    jobs: Array<Job>;
    resistivities: Array<Resistivity>;
    sites: Array<Site>;
    surveys: Array<Survey>;
    testposts: Array<Testpost>;
    trs: Array<Tr>;
}

export type NoteFilter = 'abrioxes' | 'jobs' | 'resistivities' | 'sites' | 'surveys' | 'testposts' | 'trs';
