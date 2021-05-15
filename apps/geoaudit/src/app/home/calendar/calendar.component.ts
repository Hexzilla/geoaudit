import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'geoaudit-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  addCalendarEvent(): void {
    console.log('addCalendarEvent')
    this.router.navigate(['/home/calendar/event']);
  }

  onCalendarEventClick(): void {
    console.log('onCalendarEventClick')
  }

  get isRoot(): boolean {
    return this.router.url === '/home/calendar';
  }
}
