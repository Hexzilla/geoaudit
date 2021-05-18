import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import { CalendarEvent } from '../models/calendar-event';
import { CalendarEventService } from '../services/calendar-event.service';

@Injectable()
export class CalendarEventResolver implements Resolve<CalendarEvent> {

  constructor(private calendarEventService: CalendarEventService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CalendarEvent> {
    const id = route.paramMap.get('id');
    return this.calendarEventService.getCalendarEvent(Number(id));
  }
}

