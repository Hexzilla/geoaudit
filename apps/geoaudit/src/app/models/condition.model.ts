export type Conditions = 'WORKING' | 'NOT_WORKING' | 'REPAIRING' | 'REPLACING';

export interface Condition {
    id?: number;
    name: string;
    description: string;
}