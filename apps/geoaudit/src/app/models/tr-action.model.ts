import { Condition } from "./condition.model";
import { CurrentDrain } from "./current-drain.model";
import { FaultDetail } from "./fault-detail.model";
import { Image } from "./image.model";
import { Status } from "./status.model";
import { Survey } from "./survey.model";
import { TrReadings } from "./tr-readings.model";
import { Tr } from "./tr.model";
import { User } from "./user.model";

export interface TrAction {
    name: string;
    date: string;
    tr: Tr;
    tr_readings: TrReadings;
    current_drain: CurrentDrain;
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