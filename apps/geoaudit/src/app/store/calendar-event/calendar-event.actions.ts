import { createAction, props } from '@ngrx/store';
import { Parameters } from '../../models';
import { CalendarEvent } from '../../models/calendar-event';

export const COUNT_CALENDAR_EVENTS = '[To Do List - Calendar - Events] Count';
export const SET_COUNT = '[To Do List - Calendar - Events] Set count';
export const FETCH_CALENDAR_EVENT = '[To Do List - Calendar - Events] Fetch calendar event';
export const FETCH_CALENDAR_EVENTS = '[To Do List - Calendar - Events] Fetch calendar events';
export const SET_CALENDAR_EVENT = '[To Do List - Calendar - Events] Set calendar event';
export const SET_CALENDAR_EVENTS = '[To Do List - Calendar - Events] Set calendar events';

export const DELETE_CALENDAR_EVENT = '[To Do List - Calendar - Events] Delete calendar event';
export const DELETE_CALENDAR_EVENTS = '[To Do List - Calendar - Events] Delete calendar events';
export const DELETE_CALENDAR_EVENT_SUCCESS = '[To Do List - Calendar - Events] Delete calendar event success';
export const DELETE_CALENDAR_EVENT_FAILED = '[To Do List - Calendar - Events] Delete calendar event failed';

export const CREATE_CALENDAR_EVENT = '[To Do list - Calendar - Events] Create calendar event';

export const countCalendarEvents = createAction(
    COUNT_CALENDAR_EVENTS,
    props<Parameters>()
);

export const setCount = createAction(
    SET_COUNT,
    props<{
        count: any
    }>()
);

export const fetchCalendarEvent = createAction(
    FETCH_CALENDAR_EVENT,
    props<{
        id: number
    }>()
);

export const fetchCalendarEvents = createAction(
    FETCH_CALENDAR_EVENTS,
    props<Parameters>()
);

export const setCalendarEvent = createAction(
    SET_CALENDAR_EVENT,
    props<{
        calendarEvent: CalendarEvent
    }>()
);

export const setCalendarEvents = createAction(
    SET_CALENDAR_EVENTS,
    props<{
        calendarEvents: Array<CalendarEvent>
    }>()
);

export const deleteCalendarEvent = createAction(
    DELETE_CALENDAR_EVENT,
    props<{
        calendarEvent: CalendarEvent
    }>()
);

export const deleteCalendarEvents = createAction(
    DELETE_CALENDAR_EVENTS,
    props<{
        calendarEvents: Array<CalendarEvent>
    }>()
);

export const deleteCalendarEventFailed = createAction(
    DELETE_CALENDAR_EVENT_FAILED,
    props<{
        calendarEvent: CalendarEvent,
        err: any
    }>()
);

export const deleteCalendarEventSuccess = createAction(
    DELETE_CALENDAR_EVENT_SUCCESS,
    props<{
        calendarEvent: CalendarEvent
    }>()
);

export const createCalendarEvent = createAction(
    CREATE_CALENDAR_EVENT,
    props<{
        calendarEvent: CalendarEvent
    }>()
);