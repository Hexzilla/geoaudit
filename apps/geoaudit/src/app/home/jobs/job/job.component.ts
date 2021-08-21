import { SelectionModel } from '@angular/cdk/collections';
import { ENTER, COMMA, P } from '@angular/cdk/keycodes';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexFill,
  ApexLegend,
  ApexYAxis,
  ApexGrid,
} from 'ng-apexcharts';

import { environment } from 'apps/geoaudit/src/environments/environment';
import { Lightbox, IAlbum } from 'ngx-lightbox';
import { fromEvent, Subject } from 'rxjs';
import {
  map,
  filter,
  distinctUntilChanged,
  switchMap,
  debounceTime,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { JobEntityService } from '../../../entity-services/job-entity.service';
import { JobTypeEntityService } from '../../../entity-services/job-type-entity.service';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import { UserEntityService } from '../../../entity-services/user-entity.service';
import { AttachmentModalComponent } from '../../../modals/attachment-modal/attachment-modal.component';
import { Job, Status, Statuses, Survey, User } from '../../../models';
import { Image } from '../../../models/image.model';
import { JobType } from '../../../models/job-type.model';
import { AlertService, AuthService, UploadService } from '../../../services';

import * as fromApp from '../../../store';

import L from 'leaflet';
import { HomeComponent } from '../../home.component';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
  grid: ApexGrid;
};

@Component({
  selector: 'geoaudit-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent implements OnInit, AfterViewInit {
  // displayedColumns: string[] = ['select', 'name', 'date_delivery', 'status'];
  dataSource: MatTableDataSource<Survey>;
  // selection = new SelectionModel<Survey>(true, []);

  // @ViewChild(MatPaginator) paginator: MatPaginator;

  // MatPaginator Inputs
  length = 0;
  pageSize = 3;
  pageSizeOptions: number[] = [];

  API_URL: string;

  id: string;

  /**
   * The primary colour to use on form elements.
   */
  color: ThemePalette = 'primary';

  /**
   * The form consisting of the form fields.
   */
  form: FormGroup;

  /**
   * The job object.
   */
  job: Job;

  /**
   * Array of job types i.e. CIPS, CAT5, etc.
   */
  jobTypes: Array<JobType>;

  /**
   * The current mode that we're in i.e.
   * are we creating a new job or are we viewing or editing
   * an existing one.
   */
  mode: 'CREATE' | 'EDIT_VIEW';

  /**
   * An array of status i.e. NOT_STARTED, ONGOING, etc.
   */
  statuses: Array<Status>;

  /**
   * Whether the form has been submitted.
   */
  submitted = false;

  surveys: Array<Survey> = [];

  private unsubscribe = new Subject<void>();

  // Chip and Autocomplete
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  userControl = new FormControl();
  filteredUsers: Array<User>;
  users: Array<User> = [];
  allUsers: Array<User> = [];

  /**
   * The user input for the autocomplete.
   */
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;

  /**
   * The mat autocomplete for the user input assignees.
   */
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  allSurveys: Array<Survey> = [];

  surveyCtrl = new FormControl();
  @ViewChild('autoSurvey') autoSurvey: MatAutocomplete;
  selectedSurvey: Survey = null;

  filteredSurveys: Array<Survey>;

  @ViewChild('chart') chart: ChartComponent;

  map: L.Map;

  public chartOptions: Partial<ChartOptions>;

  constructor(
    private formBuilder: FormBuilder,
    private jobEntityService: JobEntityService,
    private jobTypeEntityervice: JobTypeEntityService,
    private statusEntityService: StatusEntityService,
    private surveyEntityService: SurveyEntityService,
    private userEntityService: UserEntityService,
    private route: ActivatedRoute,
    private router: Router,
    private home: HomeComponent,
    private store: Store<fromApp.State>,
    private alertService: AlertService,
    private dialog: MatDialog,
    private _lightbox: Lightbox,
    private authService: AuthService,
    private uploadService: UploadService
  ) {
    this.chartOptions = {
      series: [
        {
          name: Statuses.NOT_STARTED,
          data: [44],
          color: '#FF0000',
        },
        {
          name: Statuses.ONGOING,
          data: [53],
          color: '#FFA500',
        },
        {
          name: Statuses.COMPLETED,
          data: [12],
          color: '#90EE90',
        },
        {
          name: Statuses.REFUSED,
          data: [9],
          color: '#000000',
        },
      ],
      chart: {
        type: 'bar',
        height: 100,
        stacked: true,
        stackType: '100%',

        dropShadow: {
          enabled: false,
        },

        toolbar: {
          show: false,
        },

        sparkline: {
          // enabled: true
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          // borderRadius: 15
        },
      },
      stroke: {
        width: 0,
        colors: ['#fff'],
      },
      title: {
        // text: "100% Stacked Bar"
        text: '',
      },
      xaxis: {
        // categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014]
        categories: [],
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
      tooltip: {
        // y: {
        //   formatter: function(val) {
        //     return val + "K";
        //   }
        // }
        x: {
          show: false,
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        show: false,
        position: 'bottom',
        horizontalAlign: 'left',
        offsetX: 40,
      },
    };
  }

  ngOnInit(): void {
    this.API_URL = environment.API_URL;

    // Fetch job types
    this.jobTypeEntityervice.getAll().subscribe(
      (jobTypes) => {
        this.jobTypes = jobTypes;
      },

      (err) => {}
    );

    // Fetch users for assignees
    this.userEntityService.getAll().subscribe(
      (users) => {
        this.allUsers = users;
      },

      (err) => {}
    );

    // Fetch statuses
    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.statuses = statuses;
      },

      (err) => {}
    );

    this.surveyEntityService.getAll().subscribe(
      (surveys) => {
        this.allSurveys = surveys;

        let notStartedSurveys = [];
        let onGoingSurveys = [];
        let completedSurveys = [];
        let refusedSurveys = [];

        surveys.map((survey) => {
          if (survey?.status?.name === Statuses.NOT_STARTED)
            notStartedSurveys.push(survey);
          if (survey?.status?.name === Statuses.ONGOING)
            onGoingSurveys.push(survey);
          if (survey?.status?.name === Statuses.COMPLETED)
            completedSurveys.push(survey);
          if (survey?.status?.name === Statuses.REFUSED)
            refusedSurveys.push(survey);
        });

        this.chartOptions.series = [
          {
            name: Statuses.NOT_STARTED,
            data: [notStartedSurveys.length],
            color: '#FF0000',
          },
          {
            name: Statuses.ONGOING,
            data: [onGoingSurveys.length],
            color: '#FFA500',
          },
          {
            name: Statuses.COMPLETED,
            data: [completedSurveys.length],
            color: '#90EE90',
          },
          {
            name: Statuses.REFUSED,
            data: [refusedSurveys.length],
            color: '#000000',
          },
        ];
      },

      (err) => {}
    );

    /**
     * Initialise the form with properties and validation
     * constraints.
     */
    this.initialiseForm();

    /**
     * Capture the param id if any to determine
     * whether we should fetch a job or create a new one.
     */
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.mode = 'EDIT_VIEW';
      this.editAndViewMode();
    } else {
      this.mode = 'CREATE';
      this.createMode();
    }
  }

  ngAfterViewInit(): void {
    // this.dataSource.paginator = this.paginator;

    /**
     * Used for filtering users (assignees) on a given
     * input text filter.
     */
    fromEvent(this.userInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter((res) => res.length >= 0),
        // debounceTime(1000), // if needed for delay
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        this.filteredUsers = this._filter(text);
      });

    this.surveyCtrl.valueChanges.subscribe((value) => {
      if (value) {
        this.filteredSurveys = this._filterSurveys(value);
      } else {
        this.filteredSurveys = this.allSurveys.slice();
      }
    });
  }

  editAndViewMode() {
    /**
     * Get the job by the given id extracting the
     * values and then patching the form.
     */
    this.jobEntityService.getByKey(this.id).subscribe(
      (job) => {
        this.job = job;

        const {
          status,
          name,
          reference,
          job_type,
          assignees,
          id,
          footer,
          surveys,
        } = job;

        /**
         * Patch the form with values from the
         * existing job in the database
         */
        this.form.patchValue({
          status: status?.id,
          name,
          reference,
          job_type: job_type?.id,
          assignees,
          footer,
          surveys,

          id,
          published: true,
        });

        //  After patch value so isn't triggered before.
        this.autoSave();

        /**
         * Do not push already existing surveys onto the array.
         */
        assignees.map((assignee) => {
          if (!this.users.find((item) => item.id === assignee.id)) {
            this.users.push(assignee);
          }
        });

        surveys.map((survey) => {
          if (!this.surveys.find((item) => item.id === survey.id)) {
            this.surveys.push(survey);
          }
        });

        this.dataSource = new MatTableDataSource(surveys);
      },

      (err) => {}
    );
  }

  createMode() {
    /**
     * Create a new job using the default form values
     * and then extract the id ready for when we
     * update the form.
     */

    this.form.patchValue({
      assignees: this.form.value.assignees
        ? [...this.form.value.assignees, this.authService.authValue.user.id]
        : [this.authService.authValue.user.id],
    });

    this.jobEntityService.add(this.form.value).subscribe(
      (job) => {
        this.job = job;
        this.form.patchValue({
          id: job.id,
        });

        this.autoSave();
      },

      (err) => {
        this.alertService.error('Something went wrong');
      }
    );
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      status: null,
      name: null,
      reference: null,
      job_type: null,
      assignees: [],
      surveys: [[]],

      footer: {
        images: [],
        documents: [],
      },

      id: null,
      published: false,
    });
  }

  autoSave() {
    this.form.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {
          this.submit(false);
        }),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe)
      )
      .subscribe();
  }

  submit(navigate = true) {
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
    this.jobEntityService.update(this.form.value).subscribe(
      (update) => {
        this.alertService.info('Saved Changes');

        this.dataSource = new MatTableDataSource(update.surveys);

        if (navigate) this.router.navigate([`/home/jobs`]);
      },

      (err) => {
        this.alertService.error('Something went wrong');
      },

      () => {}
    );
  }

  onSurveySelect(event: MatAutocompleteSelectedEvent): void {
    this.surveyCtrl.setValue(event.option.value.reference);
    this.selectedSurvey = event.option.value;

    this.form.patchValue({
      surveys: [...this.form.value.surveys, event.option.value.id],
    });

    //console.log(event);
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our user
    if (value) {
      const filterAllUsersOnValue = this._filter(value);

      if (filterAllUsersOnValue.length >= 1) {
        this.users.push(filterAllUsersOnValue[0]);
      }
    }

    // Clear the input value
    this.userInput.nativeElement.value = '';

    this.userControl.setValue(null);

    this.assigneesChange();
  }

  remove(user: User): void {
    const exists = this.users.find((item) => item.id === user.id);
    if (exists) {
      this.users = this.users.filter((item) => item.id !== exists.id);
    }

    this.assigneesChange();
  }

  assigneesChange(): void {
    this.form.patchValue({
      assignees: this.users.map((user) => user.id),
      published: true,
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.users.push(event.option.value);
    this.userInput.nativeElement.value = '';
    this.userControl.setValue(null);

    this.assigneesChange();
  }

  private _filter(value: string): Array<User> {
    const filterValue = value.toLowerCase();

    return this.allUsers.filter((user) => {
      return (
        user.username.toLowerCase().indexOf(filterValue) === 0 ||
        user.email.toLowerCase().indexOf(filterValue) === 0 ||
        user.id.toString() === filterValue
      );
    });
  }

  private _filterSurveys(value: string): Array<Survey> {
    const filterValue = value.toLowerCase();

    return this.allSurveys.filter((survey) => {
      return (
        (survey.name && survey.name.toLowerCase().indexOf(filterValue) === 0) ||
        (survey.reference &&
          survey.reference.toLowerCase().indexOf(filterValue) === 0) ||
        survey.id.toString() === filterValue
      );
    });
  }

  // details() {
  //   this.router.navigate([`/home/jobs/job/${this.id}/details`]);
  // }

  // attachments() {
  //   this.router.navigate([`/home/jobs/job/${this.id}/attachments`]);
  // }

  // surveys() {
  //   this.router.navigate([`/home/jobs/job/${this.id}/surveys`]);
  // }

  selectionChange(event: StepperSelectionEvent) {
    console.log("job tab clicked : " + event.selectedIndex);
    switch (event.selectedIndex) {
      case 0:
        break;
      case 2:   //for survey step clicked
        //clear all survey markers
        this.jobEntityService.CheckedJobRow.emit([]);
        break;
    }
  }

  isDetailsStepCompleted() {
    return false;
  }

  isAttachmentStepCompleted() {
    return false;
  }

  isSurveysStepCompleted() {
    //console.log("survey selected");
    return false;
  }

  onImageUpload(event): void {
    const { images } = this.form.value.footer;

    // this.images.push(event)

    // May be multiple so just preserving the previous object on the array of images

    this.form.patchValue({
      footer: {
        ...this.form.value.footer,
        images: [...images, event],
      },
    });

    this.submit(false);
  }

  onDocumentUpload(event): void {
    const { documents } = this.form.value.footer;

    this.form.patchValue({
      footer: {
        ...this.form.value.footer,
        documents: [...documents, event],
      },
    });

    this.submit(false);
  }

  onPreview(fileType: FileTypes): void {
    const { images, documents } = this.form.value.footer;
    this.uploadService.onPreview(fileType, images, documents);
  }

  delete(surveys: Array<Survey>): void {
    let newSurveys = this.form.value.surveys;

    surveys.map((survey) => {
      newSurveys = newSurveys.filter((x) => x.id !== survey.id);
    });

    this.surveys = newSurveys;
    console.log(this.surveys);
    this.dataSource.data = newSurveys;

    const ids = newSurveys.map((survey) => survey.id);
    
    this.form.patchValue({
      surveys: ids,
    });
  }
}
