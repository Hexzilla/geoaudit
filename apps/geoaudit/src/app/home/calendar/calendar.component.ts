import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
import {
  CalendarDateFormatter,
  CalendarEvent as AngularCalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

// Store
import * as fromApp from '../../store';
import * as CalendarEventActions from '../../store/calendar-event/calendar-event.actions';
import * as CalendarEventSelectors from '../../store/calendar-event/calendar-event.selectors';

// Models
import { CalendarEvent } from '../../models';
import { filter, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { CustomDateFormatter } from './custom-date-formatter.provider';

@Component({
  selector: 'geoaudit-calendar',
  templateUrl: './calendar.component.html',
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./calendar.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
})
export class CalendarComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt fa-lg"></i>', // See https://angular-calendar.com/#/custom-event-class https://angular-calendar.com/#/show-dates-on-titles
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: AngularCalendarEvent }): void => {
        this.onCalendarEventClick(event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt fa-lg"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: AngularCalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  modalData: {
    action: string;
    event: AngularCalendarEvent;
  };

  calendarEvents: Array<CalendarEvent>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  refresh: Subject<any> = new Subject();

  events: AngularCalendarEvent[] = [];
  // [
  //   {
  //     start: subDays(startOfDay(new Date()), 1),
  //     end: addDays(new Date(), 1),
  //     title: 'A 3 day event',
  //     color: colors.red,
  //     actions: this.actions,
  //     allDay: true,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true,
  //     },
  //     draggable: true,
  //   },
  //   {
  //     start: startOfDay(new Date()),
  //     title: 'An event with no end date',
  //     color: colors.yellow,
  //     actions: this.actions,
  //   },
  //   {
  //     start: subDays(endOfMonth(new Date()), 3),
  //     end: addDays(endOfMonth(new Date()), 3),
  //     title: 'A long event that spans 2 months',
  //     color: colors.blue,
  //     allDay: true,
  //   },
  //   {
  //     start: addHours(startOfDay(new Date()), 2),
  //     end: addHours(new Date(), 2),
  //     title: 'A draggable and resizable event',
  //     color: colors.yellow,
  //     actions: this.actions,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true,
  //     },
  //     draggable: true,
  //   },
  // ];

  activeDayIsOpen: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>
  ) {}

  ngOnInit(): void {
    /**
     * Fetch the calendar events from the backend.
     */
    this.store.dispatch(
      CalendarEventActions.fetchCalendarEvents({ start: 0, limit: 100 })
    );

    // let

    /**
     * Using the selector, select the calendar events from the store
     * return when not null and the first.
     */
    this.store
      .select(CalendarEventSelectors.CalendarEvents)
      .pipe(filter((calendarEvents) => calendarEvents !== null))
      .subscribe((calendarEvents) => {
        const events = [];

        this.calendarEvents = calendarEvents;

        calendarEvents.map((event) => {
          // const { start, end } = event;

          // allDay: false
          // created_at: "2021-07-09T16:50:42.994Z"
          // end: "2021-07-09T16:50:42.846Z"
          // id: 9
          // notes: ""
          // published: false
          // start: "2021-07-09T16:50:42.846Z"
          // surveys: []
          // title: "Event Title"
          // updated_at: "2021-07-09T16:50:42.994Z"
          // users_permissions_users: [{…}]

          /**
           * Push angular calendar event objects onto the
           * array. Note here, that we're using ...event which means
           * that we're taking all of the properties on our calendar event object
           * from the database and applying them here such.
           *
           * We have to override the dates as otherwise they do not work.
           */
          events.push({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            // Additional properties
            // actions: this.actions,
            // resizable: {
            // beforeStart: true,
            // afterEnd: true,
            // },
            draggable: true,

            cssClass: 'calendar-event-item'
          });

          // this.events = [
          //   {
          //     start: subDays(startOfDay(new Date()), 1),
          //     end: addDays(new Date(), 1),
          //     title: 'A 3 day event',
          //     color: colors.red,
          //     actions: this.actions,
          //     allDay: true,
          //     resizable: {
          //       beforeStart: true,
          //       afterEnd: true,
          //     },
          //     draggable: true,
          //   },
          //   {
          //     start: startOfDay(new Date()),
          //     title: 'An event with no end date',
          //     color: colors.yellow,
          //     actions: this.actions,
          //   },
          //   {
          //     start: subDays(endOfMonth(new Date()), 3),
          //     end: addDays(endOfMonth(new Date()), 3),
          //     title: 'A long event that spans 2 months',
          //     color: colors.blue,
          //     allDay: true,
          //   },
          //   {
          //     start: addHours(startOfDay(new Date()), 2),
          //     end: addHours(new Date(), 2),
          //     title: 'A draggable and resizable event',
          //     color: colors.yellow,
          //     actions: this.actions,
          //     resizable: {
          //       beforeStart: true,
          //       afterEnd: true,
          //     },
          //     draggable: true,
          //   },
          // ];
        });

        this.events = events;
      });
  }

  addCalendarEvent(): void {
    this.router.navigate(['/home/calendar/event']);
  }

  onCalendarEventClick(event: AngularCalendarEvent): void {
    this.router.navigate([`/home/calendar/event/${event.id}`]);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });

    // Dispatch changes to calendar event
    this.store.dispatch(
      CalendarEventActions.putCalendarEvent({
        calendarEvent: {
          id: Number(event.id),
          start: moment(newStart).toISOString(),
          end: moment(newEnd).toISOString(),
        },
      })
    );

    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: AngularCalendarEvent): void {
    // this.modalData = { event, action };
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  deleteEvent(eventToDelete: AngularCalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  get isRoot(): boolean {
    return this.router.url === '/home/calendar';
  }
}
