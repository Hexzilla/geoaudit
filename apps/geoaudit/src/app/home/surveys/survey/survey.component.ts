import {
  Component,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromApp from '../../../store';
import { Status, Statuses, Survey, User, Image, Job } from '../../../models';
import { AlertService, UploadService } from '../../../services';
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

  color: ThemePalette = 'primary';

  id: string;

  form: FormGroup;

  statuses: Array<Status>;

  survey: Survey;

  private unsubscribe = new Subject<void>();

  preparedByCtrl = new FormControl();

  conductedByCtrl = new FormControl();

  filteredUsers: Array<User>;

  allUsers: Array<User> = [];

  allJobs: Array<Job> = [];

  jobCtrl = new FormControl();

  filteredJobs: Array<Job>;

  latCtrl = new FormControl();

  lngCtrl = new FormControl();

  // ngxMatDatetimePicker
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

  public selectedTabIndex = 0;
  attachedImages: Array<any>;
  Documents: Array<any>;

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
    private uploadService: UploadService,
    private _lightbox: Lightbox,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.jobEntityService.getAll().subscribe(
      (jobs) => {
        this.allJobs = jobs;
      },

      (err) => { }
    );

    // Fetch statuses
    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.statuses = statuses;
      },

      (err) => { }
    );

    // Fetch users for assignees
    this.userEntityService.getAll().subscribe(
      (users) => {
        this.allUsers = users;
      },

      (err) => { }
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
    this.initForm();

    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.getSurveyAndPatchForm();
    } else {
      this.createMode();
    }
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

  getSurveyAndPatchForm() {
    this.surveyEntityService.getByKey(this.id).subscribe(
      (survey) => {
        this.patchForm(survey);
      },

      (err) => { }
    );
  }

  patchForm(survey: Survey) {
    const {
      status,
      name,
      job,
      id,
      prepared_by,
      conducted_by,
      geometry,
      reference,

      comment,

      images,
      documents,
    } = survey;

    this.form.patchValue({
      status: status?.id,
      name,

      job,

      reference,

      prepared_by: prepared_by?.id,
      conducted_by: conducted_by?.id,

      geometry,

      comment,

      images,
      documents,

      id,
    });

    const jobId = this.route.snapshot.queryParamMap.get('job');

    if (jobId) {
      this.jobEntityService.getByKey(jobId).subscribe((item) => {
        this.form.patchValue({
          job: item,
        });
      });
    }

    this.jobCtrl.setValue(job?.reference);

    this.preparedByCtrl.setValue(prepared_by?.username);

    this.conductedByCtrl.setValue(conducted_by?.username);

    this.latCtrl.setValue(geometry?.lat);
    this.lngCtrl.setValue(geometry?.lng);

    this.autoSave(this.id ? false : true);

    this.survey = survey;
  }

  createMode() {
    /**
     * Create a new job using the default form values
     * and then extract the id ready for when we
     * update the form.
     */
    this.surveyEntityService.add(this.form.value).subscribe(
      (survey) => {
        // this.survey = survey;

        // this.form.patchValue({
        //   id: survey.id,
        // });

        // this.autoSave();

        // this.router.navigate([`/home/surveys/${this.form.value.id}`], {
        //   replaceUrl: true,
        // });
        this.patchForm(survey);
      },

      (err) => {
        this.alertService.error('Something went wrong');
      }
    );
  }

  onJobSelect(event: MatAutocompleteSelectedEvent): void {
    this.jobCtrl.setValue(event.option.value.reference);

    this.form.patchValue({
      job: event.option.value.id,
    });
  }

  onPreparedBySelect(event: MatAutocompleteSelectedEvent): void {
    this.preparedByCtrl.setValue(event.option.value.username);

    this.form.patchValue({
      prepared_by: event.option.value.id,
    });
  }

  onConductedBySelect(event: MatAutocompleteSelectedEvent): void {
    this.conductedByCtrl.setValue(event.option.value.username);

    this.form.patchValue({
      conducted_by: event.option.value.id,
    });
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
            .navigate([`/home/surveys/${this.form.value.id}`])
            .then(() => {
              window.location.reload();
            });
        }
      });
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initForm(): void {
    this.form = this.formBuilder.group({
      status: [null],
      name: [null],

      date_assigned: [moment().toISOString()],
      date_delivery: [moment().toISOString()],

      images: [[]],
      documents: [[]],

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

      images: [],
      documents: [],

      comment: [null],

      id: [null],
      reference: [null],
      // published: false,
    });
  }

  submit(navigate = true): void {
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

      () => { }
    );
  }

  clickMarker(): void {
    this.store.dispatch(
      MapActions.toggleSidebar({
        url: this.router.url,
      })
    );
  }

<<<<<<< HEAD
  /**
   * On selection change of the steps i.e.
   * click on step 1 -> catch event -> do something.
   * @param event
   */
  selectionChange(event: StepperSelectionEvent) {
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

=======
>>>>>>> main
  onImageUpload(event): void {
    const { images } = this.form.value;

    this.form.patchValue({
      images: [...images, event],
    });

    this.getUploadFiles();
    this.submit(false);
  }

  onDocumentUpload(event): void {
    const { documents } = this.form.value;

    this.form.patchValue({
      documents: [...documents, event],
    });

    this.getUploadFiles();
    this.submit(false);
  }

  onPreview(fileType: FileTypes): void {
    const { images, documents } = this.form.value;
    this.uploadService.onPreview(fileType, images, documents);
  }

<<<<<<< HEAD
  onItemPreview(param: any): void {
    const { images, documents } = this.form.value;
    this.uploadService.onItemPreview(param.fileType, images, documents, param.index);
  }

  getUploadFiles(): void {
      const { images, documents } = this.form.value;
      this.attachedImages = this.uploadService.getImageUploadFiles(images);
      this.Documents = this.uploadService.getDocumentUploadFiles(documents);
=======
    switch (fileType) {
      case FileTypes.IMAGE:
        let _album: Array<IAlbum> = [];

        images.map((image: Image) => {
          const album = {
            src: `${environment.API_URL}${image.url}`,
            caption: image.name,
            thumb: `${environment.API_URL}${image.formats.thumbnail.url}`,
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

        dialogRef.afterClosed().subscribe((result) => { });
        break;
    }
>>>>>>> main
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

      (err) => { }
    );
  }

  selectedIndexChange(selectedTabIndex) {
    this.selectedTabIndex = selectedTabIndex;
  }
}
