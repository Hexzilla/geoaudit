import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

import * as SurveyActions from '../../../store/survey/survey.actions';

import { AlertService, SurveyService } from '../../../services';
import * as fromApp from '../../../store';
import * as CalendarEventActions from '../../../store/calendar-event/calendar-event.actions';
import { Result, Survey } from '../../../models';
import { fromEvent } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs/operators';

@Component({
  selector: 'geoaudit-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit, AfterViewInit {
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
  surveyControl = new FormControl();
  filteredSurveys: Array<Survey>;
  surveys: Array<Survey> = [];
  allSurveys: Array<Survey> = [];

  @ViewChild('surveyInput') surveyInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(
      SurveyActions.countSurveys({ start: null, limit: null })
    );

    this.store.dispatch(SurveyActions.fetchSurveys({ start: 0, limit: 100 }));

    this.store.select('survey').subscribe((state) => {
      this.length = state.count;
      this.allSurveys = state.surveys;
    });

    this.form = this.formBuilder.group({
      title: ['Event Title', Validators.required],
      allDay: [false, Validators.required],
      start: [moment().toISOString(), Validators.required],
      end: [moment().toISOString(), Validators.required],
      notes: [''],
      surveys: [[], Validators.required],

      id: null,
    });

    // Determine whether a calendar-event id has been provided
    const id = this.route.snapshot.paramMap.get('id');

    /**
     * If id provided then fetch the calendar event with the id
     * form the backend and then subscribe to the store
     * and then patch the form with the values.
     */
    if (id) {
      this.store.dispatch(
        CalendarEventActions.fetchCalendarEvent({
          id: Number(id),
        })
      );

      /**
       * Subscribe to store and patch form values.
       */
      this.store.select('calendarEvent').subscribe((state) => {
        if (state.calendarEvent) {
          const {
            title,
            allDay,
            start,
            end,
            notes,
            surveys,

            id,
          } = state.calendarEvent;
          this.form.patchValue({
            title,
            allDay,
            start,
            end,
            notes,
            surveys,

            id,
          });

          /**
           * Do not push already existing surveys onto the array.
           */
          surveys.map((survey) => {
            if (!this.surveys.find((item) => item.id === survey.id)) {
              this.surveys.push(survey);
            }
          });
        }
      });
    } else {
      /**
       * We only expect an array of surveys as query parameter
       * before we create a Calendar Event.
       */
      this.store.select('survey').subscribe((state) => {
        if (state.result === Result.SUCCESS) {
          // Survey ids as query parameter.
          const surveys = this.route.snapshot.queryParamMap.get('surveys');

          // If the value is null, create a new array and store it
          // Else parse the JSON string we sent into an array
          if (surveys === null) {
            this.surveys = new Array<Survey>();
          } else {
            const parsedSurveys = JSON.parse(surveys);

            if (parsedSurveys) {
              parsedSurveys.map((id) => {
                const exists = state.surveys.find((survey) => survey.id === id);
                if (exists) {
                  if (!this.surveys.find((survey) => survey.id === id)) {
                    this.surveys.push(exists);
                  }
                }
              });
            }
          }
        }
      });
      this.store.dispatch(
        CalendarEventActions.createCalendarEvent({
          calendarEvent: this.form.value,
        })
      );

      this.store.select('calendarEvent').subscribe((state) => {
        if (state.calendarEvent) {
          this.form.patchValue({
            id: state.calendarEvent.id,
          });
        }
      });
    }
  }

  ngAfterViewInit(): void {
    fromEvent(this.surveyInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter((res) => res.length >= 0),
        // debounceTime(1000), // if needed for delay
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        this.filteredSurveys = this._filter(text);
      });
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
    this.form.patchValue({
      surveys: this.surveys.map((survey) => survey.id),
    });

    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
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
        this.router.navigate([`/home/calendar`]);
      }

      if (state.result === Result.ERROR) {
        this.alertService.success(
          'An Error Occurred Whilst Trying To Update Your Calendar Event'
        );
        this.store.dispatch(CalendarEventActions.clearResult());
      }
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our survey
    if (value) {
      const filterAllSurveysOnValue = this._filter(value);

      if (filterAllSurveysOnValue.length >= 1) {
        this.surveys.push(filterAllSurveysOnValue[0]);
      }
    }

    // Clear the input value
    this.surveyInput.nativeElement.value = '';

    this.surveyControl.setValue(null);
  }

  remove(survey: Survey): void {
    const exists = this.surveys.find((item) => item.id === survey.id);
    if (exists) {
      this.surveys = this.surveys.filter((item) => item.id !== exists.id);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.surveys.push(event.option.value);
    this.surveyInput.nativeElement.value = '';
    this.surveyControl.setValue(null);
  }

  private _filter(value: string): Array<Survey> {
    const filterValue = value.toLowerCase();

    return this.allSurveys.filter((survey) => {
      return (
        survey.name.toLowerCase().indexOf(filterValue) === 0 ||
        survey.id.toString() === filterValue
      );
    });
  }
}
