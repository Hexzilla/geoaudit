import { DeletionType } from "./deletion-type.model";

export interface Deletion {
    data: object;
    deletion_type: DeletionType;
}