import { Condition } from "./condition.model";
import { CurrentDrain } from "./current-drain.model";
import { FaultDetail } from "./fault-detail.model";
import { Image } from "./image.model";
import { Status } from "./status.model";
import { Survey } from "./survey.model";
import { Testpost } from "./testpost.model";
import { TpInformation } from "./tp-information.model";
import { User } from "./user.model";

export interface TpAction {
    id: string;
    date: string;
    testpost: Testpost;
    tp_information: TpInformation;
    current_drain: Array<CurrentDrain>;
    pipe_depth: string;
    reinstatement: string;
    survey: Survey;
    fault_detail: Array<FaultDetail>;
    status: Status;
    condition: Condition;

    images: Array<Image>;
    documents: Array<any>;
    comment: Array<any>;
    approved: boolean;
    approved_by: User;
}