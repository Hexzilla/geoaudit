import { Action, createReducer, on } from "@ngrx/store";
import { CalendarEvent } from "../../models/calendar-event";

import * as CalendarEvents from './calendar-event.actions';

export interface State {
    count: number,
    calendarEvent: CalendarEvent,
    calendarEvents: Array<CalendarEvent>
}

export const initialState: State = {
    count: 0,
    calendarEvent: null,
    calendarEvents: []
}

const calendarEventReducer = createReducer(
    initialState,
    on(CalendarEvents.setCount, (state, action) => {
        return {
            ...state,
            count: action.count
        }
    }),
    on(CalendarEvents.fetchCalendarEvent, (state, action) => {
        return {
            ...state,
        }
    }),
    on(CalendarEvents.fetchCalendarEvents, (state, action) => {
        return {
            ...state,
        }
    }),
    on(CalendarEvents.setCalendarEvent, (state, action) => {
        return {
            ...state,
            calendarEvent: action.calendarEvent
        }
    }),
    on(CalendarEvents.setCalendarEvents, (state, action) => {
        return {
            ...state,
            calendarEvents: action.calendarEvents
        }
    }),
    on(CalendarEvents.deleteCalendarEventSuccess, (state, action) => {
        return {
            ...state,
            calendarEvents: state.calendarEvents.filter(calendarEvent => calendarEvent.id !== action.calendarEvent.id)
        }
    }),
)

export function reducer(state: State | undefined, action: Action) {
    return calendarEventReducer(state, action);
}