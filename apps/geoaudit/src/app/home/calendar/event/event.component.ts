import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';

import { AlertService, SurveyService } from '../../../services';
import * as fromApp from '../../../store';
import * as CalendarEventActions from '../../../store/calendar-event/calendar-event.actions';
import { Result } from '../../../models';

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

  @ViewChild('startDateTimePicker') startDateTimePicker: any;
  @ViewChild('endDateTimePicker') endDateTimePicker: any;

  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public minDate: Date;
  public maxDate: Date;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public disableMinute = false;
  public hideTime = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService,
    private store: Store<fromApp.State>,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: ['Event Title', Validators.required],
      allDay: [false, Validators.required],
      start: [moment().toISOString(), Validators.required],
      end: [moment().toISOString(), Validators.required],
      notes: [''],
      surveys: [[], Validators.required],

      id: null
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
          const {
            title,
            allDay,
            start,
            end,
            notes,
            surveys,

            id
          } = state.calendarEvent;
          this.form.patchValue({
            title,
            allDay,
            start,
            end,
            notes,
            surveys,

            id
          });
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

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  /**
   * All day toggle slider.
   *
   * If enabled then patch form values start and end to start and end of day respectively
   * otherwise to the current date time.
   */
  toggleAllDay(): void {
    if (this.form.value.allDay) {
      this.form.patchValue({
        start: moment().startOf('day').toISOString(),
        end: moment().endOf('day').toISOString(),
      });
    } else {
      this.form.patchValue({
        start: moment().toISOString(),
        end: moment().toISOString(),
      });
    }
  }

  submit(): void {
    console.log('submit', this.form.value);

    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    if (!this.form.invalid) {
      console.log('invalid')
      this.alertService.error('Invalid');
      return;
    }

    this.store.dispatch(
      CalendarEventActions.putCalendarEvent({
        calendarEvent: this.form.value,
      })
    );

    this.store.select('calendarEvent').subscribe((state) => {
      if (state.result === Result.SUCCESS) {
        this.alertService.success('Calendar Event Successfully Updated');
        this.store.dispatch(CalendarEventActions.clearResult());
      }

      if (state.result === Result.ERROR) {
        this.alertService.success('An Error Occurred Whilst Trying To Update Your Calendar Event');
        this.store.dispatch(CalendarEventActions.clearResult());
      }
    });
  }
}
