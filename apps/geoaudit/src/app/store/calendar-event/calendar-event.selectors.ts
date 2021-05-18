import { createSelector } from "@ngrx/store";

import { State } from './calendar-event.reducer';

export const CalendarEvent = createSelector(
    state => state['calendarEvent'],
    (state: State) => {
        return state.calendarEvent;
    }
)

export const CalendarEvents = createSelector(
    state => state['calendarEvent'],
    (state: State) => {
        return state.calendarEvents;
    }
)

export const Result = createSelector(
    state => state['calendarEvent'],
    (state: State) => {
        return state.result;
    }
)