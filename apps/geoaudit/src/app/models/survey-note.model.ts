import { Image } from "./image.model";
import { Survey } from "./survey.model";
import { User } from "./user.model";

export interface SurveyNote {
    date: string;
    description: string;
    user: User;
    image: Image;
    attachment: Image;
    survey: Survey;
}