import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';

import { AlertService, AuthService } from '../../../services';
import { Event } from '../../../models';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import { JobEntityService } from '../../../entity-services/job-entity.service';
import { Subject } from 'rxjs';
import { EventEntityService } from '../../../entity-services/event-entity.service';

@Component({
  selector: 'geoaudit-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit {
  id: string;

  color: ThemePalette = 'primary';

  form: FormGroup;

  loading = false;

  length = 100;
  pageSize = 100;

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

  // Chip and Autocomplete
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  private unsubscribe = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private eventEntityService: EventEntityService,
    private surveyEntityService: SurveyEntityService,
    private jobEntityService: JobEntityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.initForm();

    if (this.id) {
      this.getNoteAndPatchForm(this.id);
    } else {
      this.createMode();
    }
  }

  getNoteAndPatchForm(id: string) {
    this.eventEntityService.getByKey(id).subscribe(
      (calendarEvent) => {
        this.patchForm(calendarEvent);
      },

      (err) => {}
    );
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      title: [null],
      allDay: [false],
      start: [moment().toISOString()],
      end: [moment().toISOString()],
      notes: [null],

      users_permissions_users: [[]],
      surveys: [[]],
      jobs: [[]],

      id: null,
      published: false,
    });
  }

  patchForm(event: Event) {
    const {
      id,
      title,
      allDay,
      start,
      end,
      notes,
      surveys,
      jobs,
      users_permissions_users,
    } = event;

    console.log('event', event.surveys);

    this.form.patchValue({
      id,
      title,
      allDay,
      start,
      end,
      notes,
      surveys,
      jobs,
      users_permissions_users,
    });

    const surveyIds = this.route.snapshot.queryParamMap.get('surveys');

    if (surveyIds) {
      JSON.parse(surveyIds).map((surveyId) => {
        this.surveyEntityService.getByKey(surveyId).subscribe((survey) => {
          this.form.patchValue({
            surveys: [...this.form.value.surveys, survey],
          });
        });
      });
    }

    const jobIds = this.route.snapshot.queryParamMap.get('jobs');

    if (jobIds) {
      JSON.parse(jobIds).map((jobId) => {
        this.jobEntityService.getByKey(jobId).subscribe((job) => {
          this.form.patchValue({
            jobs: [...this.form.value.jobs, job],
          });
        });
      });
    }

    this.autoSave();
  }

  createMode() {
    this.form.patchValue({
      users_permissions_users: [this.authService.authValue.user],
    });

    this.eventEntityService.add(this.form.value).subscribe(
      (calendarEvent) => {
        this.patchForm(calendarEvent);

        this.autoSave();
      },

      (err) => {}
    );
  }

  autoSave(reload = false) {
    this.form.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {
          this.submit(false);
        }),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe)
      )
      .subscribe(() => {
        /**
         * Workaround.
         *
         * When we navigate to the create a note component. We may have
         * provided a jobs query parameter. However the jobs selector is not
         * updated with that and therefore we're reloading such that it
         * goes into edit mode.
         */
        if (reload) {
          this.router
            .navigate([`/home/events/${this.form.value.id}`])
            .then(() => {
              window.location.reload();
            });
        }
      });
  }

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

  submit(navigate = true): void {
    // reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
      this.alertService.error('Invalid');
      return;
    }

    this.eventEntityService.update(this.form.value).subscribe(
      (update) => {
        this.alertService.info('Saved Changes');

        if (navigate) this.router.navigate([`/home/events`]);
      },

      (err) => {
        this.alertService.error('Something went wrong');
      },

      () => {}
    );
  }

  onItemsChange(items: Array<any>, attribute: string): void {
    this.form.patchValue({
      [attribute]: items.length > 0 ? items.map((item) => item.id) : [],
    });
  }
}
