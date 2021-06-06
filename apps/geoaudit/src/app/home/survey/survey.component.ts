import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromApp from '../../store';
import { Status, Statuses, Survey } from '../../models';
import { AlertService } from '../../services';
import { StatusEntityService } from '../../entity-services/status-entity.service';
import { SurveyEntityService } from '../../entity-services/survey-entity.service';
import { debounceTime, tap, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'geoaudit-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  color: ThemePalette = 'primary';

  id: string;

  jobId: string;

  newJob = false;

  form: FormGroup;

  mode: 'CREATE' | 'EDIT_VIEW';

  selectedStatus: string;

  /**
   * An array of status i.e. NOT_STARTED, ONGOING, etc.
   */
  statuses: Array<Status>;

  submitted = false;

  survey: Survey;

  private unsubscribe = new Subject<void>()

  @ViewChild('dateAssignedDateTimePicker') dateAssignedDateTimePicker: any;

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
    private store: Store<fromApp.State>,
    private statusEntityService: StatusEntityService,
    private surveyEntityService: SurveyEntityService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Fetch statuses
    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.statuses = statuses;
      },

      (err) => {}
    );

    /**
     * Initialise the form with properties and
     * validation constraints.
     */
    this.initialiseForm();

    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.mode = 'EDIT_VIEW';
      this.editAndViewMode();

      console.log('get survey', this.id);
    } else {
      this.mode = 'CREATE';

      console.log('no survey');
    }

    this.jobId = this.route.snapshot.queryParamMap.get('job');

    if (this.jobId) {
      console.log('get job', this.jobId);
    } else {
      console.log('no job');
    }
  }

  editAndViewMode() {
    this.surveyEntityService.getByKey(this.id).subscribe(
      (survey) => {
        this.survey = survey;

        const { status, name, id } = survey;

        this.form.patchValue({
          status: status.id,
          name,

          id
        })

        this.autoSave();
      },

      (err) => {

      }

    )
  }

  autoSave() {
    this.form.valueChanges.pipe(
      debounceTime(500),
      tap(() => {
       this.submit(false)
      }),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe),
    ).subscribe();
   }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      status: [Statuses.NOT_STARTED, Validators.required],
      name: [null, Validators.required],

      date_assigned: [moment().toISOString(), Validators.required],
      // date_delivery: [moment().toISOString(), Validators.required],

      // footer: [{
      //   images: [[]],
      //   documents: [[]],
      // }],

      // geometry: null,

      // tp_actions: [],
      // tr_actions: [],

      // job: null,

      // resistivities: [],

      // prepared_by: null,
      // conducted_by: null,

      // site: null,

      // abrioxes: null,

      // survey_notes: [],

      // calendar_events: [],

      id: null,
      reference: '',
      // published: false,
    });
  }

  submit(navigate = true): void {
    this.submitted = true;
 
    // reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
      this.alertService.error('Invalid');
      return;
    }

    /**
     * Invoke the backend with a PUT request to update
     * the job with the form values.
     * 
     * If create then navigate to the job id.
     */
    this.surveyEntityService.update(this.form.value).subscribe(
      (update) => {
         this.alertService.info('Saved Changes');

        if (navigate) this.router.navigate([`/home`]);
      },

      (err) => {
        this.alertService.error('Something went wrong');
      },

      () => {
      }
    )
  }

  /**
   * On selection change of the steps i.e.
   * click on step 1 -> catch event -> do something.
   * @param event
   */
  selectionChange(event: StepperSelectionEvent) {
    console.log('selectionChange', event.selectedIndex);
    switch (event.selectedIndex) {
      case 0:
        break;

      case 1:
        break;

      case 2:
        break;

      case 3:
        break;

      case 4:
        break;

      case 5:
        break;
    }
  }

  isStep1Completed(): boolean {
    return false;
  }

  isStep2Completed(): boolean {
    return false;
  }

  isStep3Completed(): boolean {
    return false;
  }

  isStep4Completed(): boolean {
    return false;
  }

  isStep5Completed(): boolean {
    return false;
  }

  isStep6Completed(): boolean {
    return false;
  }
}
