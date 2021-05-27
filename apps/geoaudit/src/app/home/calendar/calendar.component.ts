import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

// Store
import * as fromApp from '../../store';
import * as CalendarEventActions from '../../store/calendar-event/calendar-event.actions';
import * as CalendarEventSelectors from '../../store/calendar-event/calendar-event.selectors';

// Models
import { CalendarEvent } from '../../models';
import { filter, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'geoaudit-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  calendarEvents: Observable<Array<CalendarEvent>>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>
  ) { }

  ngOnInit(): void {
    /**
     * Fetch the calendar events from the backend.
     */
    this.store.dispatch(CalendarEventActions.fetchCalendarEvents({ start: 0, limit: 100 }));

    /**
     * Using the selector, select the calendar events from the store 
     * return when not null and the first.
     */
    this.calendarEvents = this.store.select(CalendarEventSelectors.CalendarEvents)
    .pipe(
      filter(calendarEvents => calendarEvents !== null),
    );
  }

  addCalendarEvent(): void {
    this.router.navigate(['/home/calendar/event']);
  }

  onCalendarEventClick(calendarEvent: CalendarEvent): void {
    this.router.navigate([`/home/calendar/event/${calendarEvent.id}`]);
  }

  get isRoot(): boolean {
    return this.router.url === '/home/calendar';
  }
}
