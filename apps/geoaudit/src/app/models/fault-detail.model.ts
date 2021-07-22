import { FaultType } from "./fault-type.model";

export interface FaultDetail {
    fault_desc: string;
    fault_type: FaultType;
}