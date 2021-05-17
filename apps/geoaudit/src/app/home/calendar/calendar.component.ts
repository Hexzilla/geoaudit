import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarEvent } from '../../models/calendar-event';

@Component({
  selector: 'geoaudit-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  calendarEvents: Array<CalendarEvent>;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.calendarEvents = this.route.snapshot.data.calendarEvents;
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
