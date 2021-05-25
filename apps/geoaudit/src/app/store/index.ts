import { ActionReducerMap } from '@ngrx/store';

import * as fromCalendarEvent from './calendar-event/calendar-event.reducer';
import * as fromJob from './job/job.reducer';
import * as fromSurvey from './survey/survey.reducer';

export interface State {
    calendarEvent: fromCalendarEvent.State;
    job: fromJob.State;
    survey: fromSurvey.State;
}

export const reducers: ActionReducerMap<State> = {
    calendarEvent: fromCalendarEvent.reducer,
    job: fromJob.reducer,
    survey: fromSurvey.reducer
};