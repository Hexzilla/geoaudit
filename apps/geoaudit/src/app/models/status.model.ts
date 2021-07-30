export const Statuses = {
    COMPLETED: 'COMPLETED',
    NOT_STARTED: 'NOT_STARTED',
    ONGOING: 'ONGOING',
    REFUSED: 'REFUSED'
}

export interface Status {
    created_at: string;
    description: string;
    id: number;
    name: string;
    published_at: string;
    updated_at: string;
}