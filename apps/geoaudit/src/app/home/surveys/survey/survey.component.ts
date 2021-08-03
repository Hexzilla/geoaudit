import { StepperSelectionEvent } from '@angular/cdk/stepper';
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
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromApp from '../../../store';
import { Status, Statuses, Survey, User, Image, Job } from '../../../models';
import { AlertService } from '../../../services';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import {
  debounceTime,
  tap,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { UserEntityService } from '../../../entity-services/user-entity.service';

import * as MapActions from '../../../store/map/map.actions';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { AttachmentModalComponent } from '../../../modals/attachment-modal/attachment-modal.component';
import { JobEntityService } from '../../../entity-services/job-entity.service';

@Component({
  selector: 'geoaudit-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  API_URL: string;

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

  private unsubscribe = new Subject<void>();

  @ViewChild('dateAssignedDateTimePicker') dateAssignedDateTimePicker: any;
  @ViewChild('dateDeliveryDateTimePicker') dateDeliveryDateTimePicker: any;

  preparedByCtrl = new FormControl();
  @ViewChild('autoPreparedBy') matAutocompletePreparedBy: MatAutocomplete;
  selectedPreparedBy: User = null;

  conductedByCtrl = new FormControl();
  @ViewChild('autoConductedBy') autoConductedBy: MatAutocomplete;
  selectedConductedBy: User = null;

  filteredUsers: Array<User>;

  users: Array<User>;

  allUsers: Array<User> = [];

  allJobs: Array<Job> = [];

  jobCtrl = new FormControl();
  @ViewChild('autoJob') autoJob: MatAutocomplete;
  selectedJob: Job = null;

  filteredJobs: Array<Job>;

  // @ViewChild('auto') matAutocomplete: MatAutocomplete;

  @ViewChild('latCtrlInput') latCtrlInput: ElementRef;
  @ViewChild('lngCtrlInput') lngCtrlInput: ElementRef;

  latCtrl = new FormControl();

  lngCtrl = new FormControl();

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
    private jobEntityService: JobEntityService,
    private statusEntityService: StatusEntityService,
    private surveyEntityService: SurveyEntityService,
    private userEntityService: UserEntityService,
    private alertService: AlertService,
    private _lightbox: Lightbox,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.API_URL = environment.API_URL;

    this.jobEntityService.getAll().subscribe(
      (jobs) => {
        this.allJobs = jobs;
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

    // Fetch users for assignees
    this.userEntityService.getAll().subscribe(
      (users) => {
        this.allUsers = users;
        console.log('users', users);
      },

      (err) => {}
    );

    this.store.select('map').subscribe((map) => {
      if (map.clickMarker) {
        this.latCtrl.setValue(map.clickMarker.lat);
        this.lngCtrl.setValue(map.clickMarker.lng);
      }
    });

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
      this.createMode();

      console.log('no survey');
    }

    // this.jobId = this.route.snapshot.queryParamMap.get('job');

    // if (this.jobId) {
    //   this.jobEntityService.getByKey(this.jobId).subscribe(
    //     (job) => {
    //       console.log('job', job);
    //       this.form.patchValue({
    //         job,
    //       });

    //       console.log('this', this.form.value);
    //     },

    //     (err) => {}
    //   );
    // }
  }

  ngAfterViewInit() {
    this.jobCtrl.valueChanges.subscribe((value) => {
      if (value) {
        this.filteredJobs = this._filterJobs(value);
      } else {
        this.filteredJobs = this.allJobs.slice();
      }
    });

    this.preparedByCtrl.valueChanges.subscribe((value) => {
      if (value) {
        this.filteredUsers = this._filterUsers(value);
      } else {
        this.filteredUsers = this.allUsers.slice();
      }
    });

    this.conductedByCtrl.valueChanges.subscribe((value) => {
      if (value) {
        this.filteredUsers = this._filterUsers(value);
      } else {
        this.filteredUsers = this.allUsers.slice();
      }
    });

    this.latCtrl.valueChanges.subscribe((value) => {
      if (value) {
        this.form.patchValue({
          geometry: {
            ...this.form.value.geometry,
            lat: value,
          },
        });
      }
    });

    this.lngCtrl.valueChanges.subscribe((value) => {
      if (value) {
        this.form.patchValue({
          geometry: {
            ...this.form.value.geometry,
            lng: value,
          },
        });
      }
    });
  }

  editAndViewMode() {
    this.surveyEntityService.getByKey(this.id).subscribe(
      (survey) => {
        this.survey = survey;

        const {
          status,
          name,
          job,
          id,
          prepared_by,
          conducted_by,
          geometry,
          footer,
          reference,
        } = survey;

        this.form.patchValue({
          status: status?.id,
          name,

          job,

          reference,

          prepared_by: prepared_by?.id,
          conducted_by: conducted_by?.id,

          geometry,

          footer: footer
            ? footer
            : {
                images: [],
                documents: [],
              },

          id,
        });

        console.log('job', job);

        this.jobCtrl.setValue(job?.reference);
        this.selectedJob = job;

        this.preparedByCtrl.setValue(prepared_by?.username);
        this.selectedPreparedBy = prepared_by;

        this.conductedByCtrl.setValue(conducted_by?.username);
        this.selectedConductedBy = conducted_by;

        this.latCtrl.setValue(geometry?.lat);
        this.lngCtrl.setValue(geometry?.lng);

        this.autoSave();
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
    this.surveyEntityService.add(this.form.value).subscribe(
      (survey) => {
        console.log('survey', survey);
        this.survey = survey;

        this.form.patchValue({
          id: survey.id,
        });

        this.autoSave();

        this.router.navigate([`/home/surveys/${this.form.value.id}`], {
          replaceUrl: true,
        });
      },

      (err) => {
        this.alertService.error('Something went wrong');
      }
    );
  }

  onJobSelect(event: MatAutocompleteSelectedEvent): void {
    this.jobCtrl.setValue(event.option.value.reference);
    this.selectedJob = event.option.value;

    this.form.patchValue({
      job: event.option.value.id,
    });
  }

  onPreparedBySelect(event: MatAutocompleteSelectedEvent): void {
    this.preparedByCtrl.setValue(event.option.value.username);
    this.selectedPreparedBy = event.option.value;

    this.form.patchValue({
      prepared_by: event.option.value.id,
    });
  }

  onConductedBySelect(event: MatAutocompleteSelectedEvent): void {
    this.conductedByCtrl.setValue(event.option.value.username);
    this.selectedConductedBy = event.option.value;

    this.form.patchValue({
      conducted_by: event.option.value.id,
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

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      status: [null, Validators.required],
      name: [null, Validators.required],

      date_assigned: [moment().toISOString(), Validators.required],
      date_delivery: [moment().toISOString(), Validators.required],

      // footer: [{
      //   images: [[]],
      //   documents: [[]],
      // }],

      geometry: [null],

      // // tp_actions: [],
      // // tr_actions: [],

      job: [null],

      // // resistivities: [],

      prepared_by: [null],
      conducted_by: [null],

      // // site: null,

      // // abrioxes: null,

      // // survey_notes: [],

      // // calendar_events: [],

      // footer: [
      //   {
      //     images: [[]],
      //     documents: [[]],
      //   },
      // ],

      id: [null],
      reference: [null],
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

      () => {}
    );
  }

  clickMarker(): void {
    this.store.dispatch(
      MapActions.toggleSidebar({
        url: this.router.url,
      })
    );
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

  onImageUpload(event): void {
    console.log('on image upload', event);

    const { images } = this.form.value.footer;

    console.log('images', [...images, event]);

    // this.images.push(event)

    // May be multiple so just preserving the previous object on the array of images

    this.form.patchValue({
      footer: {
        ...this.form.value.footer,
        images: [...images, event],
      },
    });

    console.log('patched', this.form.value);

    this.submit(false);

    // console.log('images', this.images)
  }

  onDocumentUpload(event): void {
    console.log('onDocumentUpload', event);

    const { documents } = this.form.value.footer;

    console.log('documents', [...documents, event]);

    this.form.patchValue({
      footer: {
        ...this.form.value.footer,
        documents: [...documents, event],
      },
    });

    console.log('patched', this.form.value);

    this.submit(false);
  }

  onPreview(fileType: FileTypes): void {
    console.log('onPreview', fileType, this.form.value.footer);

    const { images, documents } = this.form.value.footer;

    switch (fileType) {
      case FileTypes.IMAGE:
        let _album: Array<IAlbum> = [];

        images.map((image: Image) => {
          const album = {
            src: `${this.API_URL}${image.url}`,
            caption: image.name,
            thumb: `${this.API_URL}${image.formats.thumbnail.url}`,
          };

          _album.push(album);
        });

        if (_album.length >= 1) this._lightbox.open(_album, 0);
        break;

      case FileTypes.DOCUMENT:
        const dialogRef = this.dialog.open(AttachmentModalComponent, {
          data: {
            fileType,
            documents,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {});
        break;
    }
  }

  /**
   * For filtering the users based on a string input value
   * @param value
   * @returns
   */
  private _filterUsers(value: string): Array<User> {
    if (value && typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.allUsers.filter(
        (user) =>
          user.username.toLowerCase().indexOf(filterValue) === 0 ||
          user.email.toLowerCase().indexOf(filterValue) === 0 ||
          user.id.toString().indexOf(filterValue) === 0
      );
    }
  }

  /**
   * For filtering the jobs based on a string input value
   * @param value
   * @returns
   */
  private _filterJobs(value: string): Array<Job> {
    if (value && typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.allJobs.filter(
        (job) =>
          (job.reference &&
            job.reference.toLowerCase().indexOf(filterValue) === 0) ||
          (job.name && job.name.toLowerCase().indexOf(filterValue) === 0) ||
          job.id.toString().indexOf(filterValue) === 0
      );
    }
  }

  delete() {
    this.surveyEntityService.delete(this.survey.id).subscribe(
      (res) => {
        this.router.navigate(['/home/todolist']);
      },

      (err) => console.log('err', err)
    );
  }
}
