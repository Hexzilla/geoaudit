import { ActionReducerMap } from '@ngrx/store';

import * as fromSurvey from './survey/survey.reducer';

export interface State {
    survey: fromSurvey.State;
}

export const reducers: ActionReducerMap<State> = {
    survey: fromSurvey.reducer
};