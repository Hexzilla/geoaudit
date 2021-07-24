import { Hazard } from "./hazard.model";

export interface SiteDetail {
    owner: string;
    region: string;
    address: string;
    scheme: string;
    access_detail: string;
    speed_limit: number;
    distance_road: string;
    road_condition: string;
    tm_required: boolean;
    tm_descr: string;
    nrswa_required: boolean;
    nrswa_description: string;
    toilet: string;
    hospital: string;
    hazard: Array<Hazard>;
}