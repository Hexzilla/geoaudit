import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import {ThemePalette} from '@angular/material/core';

import { SurveyService } from '../../../services';
import * as fromApp from '../../../store';
import * as CalendarEventActions from '../../../store/calendar-event/calendar-event.actions';

@Component({
  selector: 'geoaudit-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit {

  color: ThemePalette = 'primary';

  form: FormGroup;

  loading = false;

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService,
    private store: Store<fromApp.State>
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: ['Event Title', Validators.required],
      allDay: [false, Validators.required],
      start: [moment().toISOString(), Validators.required],
      end: [moment().toISOString(), Validators.required],
      notes: ['', Validators.required],
      surveys: [[], Validators.required],
    });

    // Determine whether a calendar-event id has been provided
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.store.dispatch(
        CalendarEventActions.fetchCalendarEvent({
          id: Number(id),
        })
      );

      this.store.select('calendarEvent').subscribe((state) => {
        if (state.calendarEvent) {
          const { title, allDay, start, end, notes, surveys } = state.calendarEvent;
          this.form.patchValue({
            title,
            allDay,
            start,
            end,
            notes,
            surveys
          })
        }
      });

    } else {
      this.store.dispatch(
        CalendarEventActions.createCalendarEvent({
          calendarEvent: this.form.value,
        })
      );

      this.store.select('calendarEvent').subscribe((state) => {
        if (state.calendarEvent) {
          console.log('her');
          this.router.navigate([
            `/home/calendar/event/${state.calendarEvent.id}`,
          ]);
        }
      });
    }

    // If a calendar-event has been provided then fetch it

    // If not then create a draft
  }
}
