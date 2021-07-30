import { Image } from "./image.model";
import { User } from "./user.model";

export interface Note {
    id?: number;
    date: string;
    description: string;
    image: Image;
    attachment: Image;
    user: User;
}

export const NoteTypes = {
    ABRIOX: 'ABRIOX',
    JOB: 'JOB',
    RESISTIVITY: 'RESISTIVITY',
    SITE: 'SITE',
    SURVEY: 'SURVEY',
    TP: 'TP',
    TR: 'TR'
}