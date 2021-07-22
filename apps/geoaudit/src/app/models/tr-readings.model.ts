import { Groundbed } from "./groundbed.model";

export interface TrReadings {
    Volt: string;
    Amps: string;
    current_settings: string;
    groundbed: Array<Groundbed>;
}