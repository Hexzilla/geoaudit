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

import * as CalendarEventSelectors from '../../../store/calendar-event/calendar-event.selectors';
import * as SurveySelectors from '../../../store/survey/survey.selectors';

import { AlertService, SurveyService } from '../../../services';
import * as fromApp from '../../../store';
import * as CalendarEventActions from '../../../store/calendar-event/calendar-event.actions';
import { Result, Survey } from '../../../models';
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';

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
    // console.log('route snp', this.route.snapshot.data.calendarEvent);

    /**
     * Fetch calendar event related data including surveys and
     * a count of the surveys.
     */
    this.fetchData();

    /**
     * Select from fetched data for event component data.
     */
    this.selectData();

    /**
     * Initialise the form with properties and
     * validation constraints.
     */
    this.initialiseForm();

    // Determine whether a calendar-event id has been provided
    const id = this.route.snapshot.paramMap.get('id');

    /**
     * If id provided then fetch the calendar event with the id
     * form the backend and then subscribe to the store
     * and then patch the form with the values.
     */
    if (id) {
      this.editAndViewMode(id);
    } else {
      this.createMode();
    }
  }

  /**
   * Fetch data using ngrx dispatch action firstly for a count of the surveys
   * and then the surveys. In selectData we subscribe to the store to use
   * this data.
   */
  fetchData(): void {
    this.store.dispatch(
      SurveyActions.countSurveys({ start: null, limit: null })
    );

    this.store.dispatch(SurveyActions.fetchSurveys({ start: 0, limit: 100 }));
  }

  /**
   * We select data from the store and we subscribe to it such that
   * should the data change, we'll have the latest.
   */
  selectData(): void {
    this.store.select(SurveySelectors.Surveys).subscribe((surveys) => {
      this.allSurveys = surveys;
    });

    this.store.select(SurveySelectors.Count).subscribe((count) => {
      this.length = count;
    });
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      title: ['Event Title', Validators.required],
      allDay: [false, Validators.required],
      start: [moment().toISOString(), Validators.required],
      end: [moment().toISOString(), Validators.required],
      notes: [''],
      surveys: [[], Validators.required],

      id: null,
      published: false
    });
  }

  /**
   * In edit and view mode, we have a calendar-event id
   * of which use to fetch the calendar-event from the backend.
   * We then patch the form values with the values from calendar-event.
   * @param id 
   */
  editAndViewMode(id: string): void {
    this.store.dispatch(
      CalendarEventActions.fetchCalendarEvent({
        id: Number(id),
      })
    );

    /**
     * Subscribe to store and patch form values.
     */
    this.store
      .select(CalendarEventSelectors.CalendarEvent)
      .subscribe((calendarEvent) => {
        if (calendarEvent) {
          const {
            title,
            allDay,
            start,
            end,
            notes,
            surveys,

            id,
          } = calendarEvent;
          this.form.patchValue({
            title,
            allDay,
            start,
            end,
            notes,
            surveys,

            id,
            published: true
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
  }

  /**
   * In create mode, we've navigated to this component route
   * without an id. We may have navigated with some survey ids
   * in the address bar of which having fetched survey data for
   * we can associate the full survey object for the survey id.
   *
   * We then proceed to create the calendar-event with the default
   * form values.
   *
   * We then subscribe to the store awaiting for the calendar-event
   * and then we can set the id within the form as required
   * for when we submit.
   */
  createMode(): void {
    /**
     * We only expect an array of surveys as query parameter
     * before we create a Calendar Event.
     */
    this.store
      .select(SurveySelectors.Surveys)
      .subscribe((surveys) => {
        // Survey ids as query parameter.
        const surveyIds = this.route.snapshot.queryParamMap.get('surveys');

        // If the value is null, create a new array and store it
        // Else parse the JSON string we sent into an array
        if (surveyIds === null) {
          this.surveys = new Array<Survey>();
        } else {
          const parsedSurveys = JSON.parse(surveyIds);

          if (parsedSurveys) {
            parsedSurveys.map((id) => {
              const exists = surveys.find((survey) => survey.id === id);
              if (exists) {
                if (!this.surveys.find((survey) => survey.id === id)) {
                  this.surveys.push(exists);
                }
              }
            });
          }
        }
      });

    this.store.dispatch(
      CalendarEventActions.createCalendarEvent({
        calendarEvent: this.form.value,
      })
    );

    this.store
      .select(CalendarEventSelectors.CalendarEvent)
      .pipe(
        filter((calendarEvent) => calendarEvent !== null),
        take(1)
      )
      .subscribe((calendarEvent) => {
        this.form.patchValue({
          id: calendarEvent.id,
        });
      });
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

  /**
   * On submit of the calendar-event form we return array of survey ids,
   * validate the form, and the make a PUT network request with the
   * calendar-event data as already exists as created on entry to this
   * component or we're in view or edit mode. Following that
   * we subscribe and then check for the result such
   * that we know what to do next i.e display an alert.
   *
   * @returns
   */
  submit(): void {
    this.form.patchValue({
      surveys: this.surveys.map((survey) => survey.id),
      published: true
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

    this.store
      .select(CalendarEventSelectors.Result)
      .pipe(
        filter((result) => result !== Result.NONE),
        take(1)
      )
      .subscribe((result) => {
        if (result === Result.SUCCESS) {
          this.alertService.success('Calendar Event Successfully Updated');
          this.store.dispatch(CalendarEventActions.clearResult());
          this.router.navigate([`/home/calendar`]);
        }

        if (result === Result.ERROR) {
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
