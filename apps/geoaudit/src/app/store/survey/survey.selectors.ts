import { createSelector } from "@ngrx/store";

import { State } from './survey.reducer';

export const Surveys = createSelector(
    state => state['survey'],
    (state: State) => {
        return state.surveys;
    }
)

export const Count = createSelector(
    state => state['survey'],
    (state: State) => {
        return state.count;
    }
)

export const Selected = createSelector(
    state => state['survey'],
    (state: State) => {
        return state.selected;
    }
)