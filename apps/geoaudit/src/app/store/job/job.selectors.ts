import { createSelector } from "@ngrx/store";

import { State } from './job.reducer';

export const Jobs = createSelector(
    state => state['job'],
    (state: State) => {
        return state.jobs;
    }
)

export const Count = createSelector(
    state => state['job'],
    (state: State) => {
        return state.count;
    }
)

export const Selected = createSelector(
    state => state['job'],
    (state: State) => {
        return state.selected;
    }
)