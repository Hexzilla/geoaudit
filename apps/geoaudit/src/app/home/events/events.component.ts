import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

import qs from 'qs';

import {
  startOfDay,
  endOfDay,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { Subject } from 'rxjs';
import {
  CalendarDateFormatter,
  CalendarEvent,
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

// Models
import { Event } from '../../models';

import { CustomDateFormatter } from './custom-date-formatter.provider';
import { MatDialog } from '@angular/material/dialog';
import { DeleteModalComponent } from '../../modals/delete-modal/delete-modal.component';
import { EventEntityService } from '../../entity-services/event-entity.service';
import { AuthService } from '../../services';

@Component({
  selector: 'geoaudit-events',
  templateUrl: './events.component.html',
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./events.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
})
export class EventsComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  actions: CalendarEventAction[] = [
    // {
    //   label: '<i class="fas fa-fw fa-pencil-alt fa-lg"></i>', // See https://angular-calendar.com/#/custom-event-class https://angular-calendar.com/#/show-dates-on-titles
    //   a11yLabel: 'Edit',
    //   onClick: ({ event }: { event: AngularCalendarEvent }): void => {
    //     this.onCalendarEventClick(event);
    //   },
    // },
    {
      label: '<i class="fas fa-fw fa-trash-alt fa-lg"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.deleteEvent(event);
      },
    },
  ];

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  events: Array<Event>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  refresh: Subject<any> = new Subject();

  calendarEvents: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private eventEntityService: EventEntityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const parameters = qs.stringify({
      _where: {
        users_permissions_users: this.authService.authValue.user.id,
      },
      _sort: 'datetime:DESC',
    });

    this.eventEntityService.getWithQuery(parameters).subscribe(
      (events) => {
        const calendarEvents = [];

        this.events = events;

        events.map((event) => {
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
          calendarEvents.push({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            // Additional properties
            actions: this.actions,
            // resizable: {
            // beforeStart: true,
            // afterEnd: true,
            // },
            draggable: true,

            cssClass: 'calendar-event-item',
          });
        });

        this.calendarEvents = calendarEvents;
      },

      (err) => {}
    );
  }

  addCalendarEvent(): void {
    this.router.navigate(['/home/events/create']);
  }

  onCalendarEventClick(event: CalendarEvent): void {
    this.router.navigate([`/home/events/${event.id}`]);
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
    this.calendarEvents = this.calendarEvents.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });

    this.eventEntityService.update({
      id: Number(event.id),
      start: moment(newStart).toISOString(),
      end: moment(newEnd).toISOString(),
    });

    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    // this.modalData = { event, action };
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.calendarEvents = [
      ...this.calendarEvents,
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

  deleteEvent(eventToDelete: CalendarEvent) {
    this.calendarEvents = this.calendarEvents.filter(
      (event) => event !== eventToDelete
    );

    const dialogRef = this.dialog.open(DeleteModalComponent, {
      data: {
        length: 1,
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eventEntityService.delete({
          id: Number(eventToDelete.id),
        });
      }
    });
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
