import { ActionReducerMap } from '@ngrx/store';

import * as fromJob from './job/job.reducer';
import * as fromMap from './map/map.reducer';
import * as fromSurvey from './survey/survey.reducer';

export interface State {
    job: fromJob.State;
    map: fromMap.State;
    survey: fromSurvey.State;
}

export const reducers: ActionReducerMap<State> = {
    job: fromJob.reducer,
    map: fromMap.reducer,
    survey: fromSurvey.reducer
};