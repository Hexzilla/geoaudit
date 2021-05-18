import { ActionReducerMap } from '@ngrx/store';

import * as fromCalendarEvent from './calendar-event/calendar-event.reducer';
import * as fromSurvey from './survey/survey.reducer';

export interface State {
    calendarEvent: fromCalendarEvent.State;
    survey: fromSurvey.State;
}

export const reducers: ActionReducerMap<State> = {
    calendarEvent: fromCalendarEvent.reducer,
    survey: fromSurvey.reducer
};