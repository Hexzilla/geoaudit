import { Action, createReducer, on } from "@ngrx/store";
import { Result } from "../../models";
import { CalendarEvent } from "../../models/calendar-event";

import * as CalendarEvents from './calendar-event.actions';

export interface State {
    count: number,
    calendarEvent: CalendarEvent,
    calendarEvents: Array<CalendarEvent>,

    result: Result
}

export const initialState: State = {
    count: 0,
    calendarEvent: null,
    calendarEvents: null,
    result: Result.NONE
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
    on(CalendarEvents.putCalendarEventSuccess, (state, action) => {
        return {
            ...state,
            calendarEvent: null,
            result: Result.SUCCESS
        }
    }),
    on(CalendarEvents.clearResult, (state, action) => {
        return {
            ...state,
            result: Result.NONE
        }
    }),
)

export function reducer(state: State | undefined, action: Action) {
    return calendarEventReducer(state, action);
}