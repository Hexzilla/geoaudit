import { Anode } from "./anode.model";
import { Coupon } from "./coupon.model";
import { Dead } from "./dead.model";
import { PipeOff } from "./pipe-off.model";
import { ReferenceCell } from "./reference-cell.model";
import { Sleeve } from "./sleeve.model";

export interface TpInformation {
    reedswitch_quantity: number;
    pipe_on: number;
    anodes_off: number;
    anode_on: number;
    anodes_current: number;
    dead: Array<Dead>;
    pipe_off: Array<PipeOff>;
    sleeve: Array<Sleeve>;
    anode: Array<Anode>;
    coupon: Array<Coupon>;
    reference_cell: ReferenceCell;
}