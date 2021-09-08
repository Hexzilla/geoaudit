import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import {
  Testpost,
  AbrioxAction,
  Status,
} from '../../../models';
import { AlertService, UploadService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { AbrioxActionEntityService } from '../../../entity-services/abriox-action-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';

@Component({
  selector: 'geoaudit-tp-action',
  templateUrl: './abriox-action.component.html',
  styleUrls: ['./abriox-action.component.scss'],
})
export class AbrioxActionComponent implements OnInit, AfterViewInit {
  /**
   * The form consisting of the form fields.
   */
  form: FormGroup;

  /**
   * An array of status i.e. NOT_STARTED, ONGOING, etc.
   */
  statuses: Array<Status>;

  /**
   * The current job state.
   */
  currentState = 0;

  /**
   * Whether the form has been submitted.
   */
  submitted = false;

  abrioxId = 0;

  actionId = 0;

  public abriox_action: AbrioxAction = null;

  public selectedTabIndex = 0;
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private surveyEntityService: SurveyEntityService,
    private testpostEntityService: TestpostEntityService,
    private statusEntityService: StatusEntityService,
    private abrioxActionEntityService: AbrioxActionEntityService,
    private store: Store<fromApp.State>,
    private router: Router,
    private alertService: AlertService,
    private uploadService: UploadService,
    private _lightbox: Lightbox,
    private dialog: MatDialog
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
     * Initialise the form with properties and validation
     * constraints.
     */
    this.initialiseForm();

    this.fetchAbrioxAction();
  }

  ngAfterViewInit(): void {
  }
  fetchAbrioxAction() {
    this.abrioxId = this.route.snapshot.params['id']
    console.log("abrioxId", this.abrioxId)

    this.actionId = this.route.snapshot.params['actionId'];
    console.log("actionId", this.actionId)

    this.abrioxActionEntityService.getByKey(this.actionId).subscribe(
      (abriox_action) => {
        this.abriox_action = abriox_action;
        console.log("abriox_action", this.abriox_action)

        //TODO - FormArray
        if (abriox_action) {
          this.form.patchValue({
            date: moment(abriox_action.date).format('L LT'),
            condition: abriox_action.condition?.name,

            images: abriox_action.images,
            documents: abriox_action.documents
          });

          //this.faults.clear();
          //fault_detail.map(item => this.addFaults(null, item));
          //console.log('this.faults', this.faults)
        }
      },
      (err) => {}
    )
  }

  get faults(): FormArray {
    return this.form.get('faults') as FormArray;
  }

  addFaults(event, item=null) {
    event?.preventDefault();
    if (item) {
		  this.faults.push(this.formBuilder.group(item));
    } else {
      this.faults.push(this.formBuilder.group({
        type: '',
        desc: ''
      }));
    }
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      date: null,
      condition: null,
      faults: new FormArray([]),
    });
  }

  submit(navigate = true) {
    console.log('submit');
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
      this.alertService.error('ALERTS.invalid');
      return;
    }

    /**
     * Invoke the backend with a PUT request to update
     * the job with the form values.
     *
     * If create then navigate to the job id.
     */
    /*this.jobEntityService.update(this.form.value).subscribe(
      (update) => {
        this.alertService.info('Saved Changes');

        this.dataSource = new MatTableDataSource(update.surveys);

        if (navigate) this.router.navigate([`/home/jobs`]);
      },

      (err) => {
        this.alertService.error('Something went wrong');
      }
    );*/
  }

  selectedIndexChange(selectedTabIndex) {
    this.selectedTabIndex = selectedTabIndex;
  }

  getActionTitle() {
    if (this.abriox_action) {
      return `Abriox [${this.abriox_action.reference}]`;
    }
    return "Abriox";
  }

  searchAbriox() {
    this.router.navigate([`/home/search`]);
  }

  updateMarkState(e) {
    if (e.complete) {
      //TODO: update action state to completed
    }
    else if (e.approve) {
      //TODO: update action state to approved
    }
    else if (e.refuse) {
      //TODO: update action state to refused
    }
  }

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

  onItemPreview(param: any): void {
    const { images, documents } = this.form.value;
    this.uploadService.onItemPreview(param.fileType, images, documents, param.index);
  }

  getUploadFiles(): void {
    const { images, documents } = this.form.value;
    this.attachedImages = this.uploadService.getImageUploadFiles(images);
    this.attachedDocuments = this.uploadService.getDocumentUploadFiles(documents);
  }
}
