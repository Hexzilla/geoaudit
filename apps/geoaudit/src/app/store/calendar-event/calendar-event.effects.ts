import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, merge, of } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap, tap } from "rxjs/operators";

import * as CalendarActions from './calendar-event.actions';
import { CalendarEventService } from "../../services/calendar-event.service";

@Injectable()
export class CalendarEventEffects {

    constructor(
        private actions$: Actions,
        private calendarEventService: CalendarEventService
    ) {}

    countCalendarEvents$ = createEffect(() => this.actions$.pipe(
        ofType(CalendarActions.COUNT_CALENDAR_EVENTS),
        mergeMap((payload) => this.calendarEventService.count(payload)
            .pipe(
                map(count => ({ type: CalendarActions.SET_COUNT, count}))
            ))
    ))
    fetchCalendarEvent$ = createEffect(() => this.actions$.pipe(
        ofType(CalendarActions.FETCH_CALENDAR_EVENT),
        mergeMap(({ id }) => this.calendarEventService.getCalendarEvent(id)
            .pipe(
                map(calendarEvent => ({ type: CalendarActions.SET_CALENDAR_EVENT, calendarEvent })),
                catchError(() => EMPTY)
            ))
    ));

    fetchCalendarEvents$ = createEffect(() => this.actions$.pipe(
        ofType(CalendarActions.FETCH_CALENDAR_EVENTS),
        tap(console.log),
        mergeMap((payload) => this.calendarEventService.getCalendarEvents(payload)
            .pipe(
                map(calendarEvents => ({ type: CalendarActions.SET_CALENDAR_EVENTS, calendarEvents })),
                catchError(() => EMPTY)
            ))
    ));

    deleteCalendarEvent$ = createEffect(() => this.actions$.pipe(
        ofType(CalendarActions.DELETE_CALENDAR_EVENT),
        mergeMap(({ calendarEvent }) => this.calendarEventService.delete(calendarEvent)
            .pipe(
                map(() => ({ type: CalendarActions.DELETE_CALENDAR_EVENT_SUCCESS, calendarEvent}))
            ))
    ));

    /**
     * Delete calendar events effect triggered on type deletecalendar.
     * This effect expects an array of calendar events. We spread the array
     * and then map through each survey calling the delete endpoint
     * for a given survey of which if successful we remove the survey
     * from the calendar events array or we raise an error.
     */
    deleteCalendarEvents$ = createEffect(() => this.actions$.pipe(
        ofType(CalendarActions.deleteCalendarEvents),
        exhaustMap(({ calendarEvents }) => 
            merge(
                ...calendarEvents.map(calendarEvent =>
                    this.calendarEventService.delete(calendarEvent).pipe(
                        map(() => ({ type: CalendarActions.DELETE_CALENDAR_EVENT_SUCCESS, calendarEvent })),
                        catchError(err =>
                            of(CalendarActions.deleteCalendarEventFailed({ calendarEvent, err: err.message })))
                    )
                )
            )
        )
    ));

    createCalendarEvent$ = createEffect(() => this.actions$.pipe(
        ofType(CalendarActions.CREATE_CALENDAR_EVENT),
        mergeMap(({ calendarEvent }) => this.calendarEventService.createCalendarEvent(calendarEvent)
            .pipe(
                map(calendarEvent => ({ type: CalendarActions.SET_CALENDAR_EVENT, calendarEvent })),
                catchError(() => EMPTY)
            ))
    ));
}