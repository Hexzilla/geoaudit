import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import { CalendarEvent } from '../models';
import { CalendarEventService } from '../services/calendar-event.service';

@Injectable()
export class CalendarEventsResolver implements Resolve<Array<CalendarEvent>> {

  constructor(private calendarEventService: CalendarEventService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Array<CalendarEvent>> {
    console.log('in the calendar events resolver')
    return this.calendarEventService.getCalendarEvents({ start: 0, limit: 10 });
  }
}

