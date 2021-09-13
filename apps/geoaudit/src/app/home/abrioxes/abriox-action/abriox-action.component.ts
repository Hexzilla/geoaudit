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
import {
  FaultType,
  AbrioxAction,
  Status,
  Statuses,
} from '../../../models';
import { AlertService, UploadService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { AbrioxActionEntityService } from '../../../entity-services/abriox-action-entity.service';
import { FaultTypeEntityService } from '../../../entity-services/fault-type-entity.service';

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

  approved = false;

  /**
   * Whether the form has been submitted.
   */
  submitted = false;

  faultTypes: Array<FaultType>;

  actionId = 0;

  public abriox_action: AbrioxAction = null;

  public selectedTabIndex = 0;
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private statusEntityService: StatusEntityService,
    private abrioxActionEntityService: AbrioxActionEntityService,
    private faultTypeEntityService: FaultTypeEntityService,
    private store: Store<fromApp.State>,
    private router: Router,
    private alertService: AlertService,
    private uploadService: UploadService,
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

    this.fetchData();
  }

  ngAfterViewInit(): void {
    //
  }


  /**
   * Initialisation of the form, properties, and validation.
   */
   initialiseForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      date: [null],
      condition: [null],
      fault_detail: new FormArray([]),
    });
  }

  fetchData() {
    this.faultTypeEntityService.getAll().subscribe(
      (faultTypes) => {
        this.faultTypes = faultTypes;
        console.log("faultTypes", faultTypes);
      }
    )

    //const abrioxId = this.route.snapshot.params['id']
    this.actionId = this.route.snapshot.params['actionId'];
    this.abrioxActionEntityService.getByKey(this.actionId).subscribe(
      (abriox_action) => {
        this.abriox_action = abriox_action;
        console.log("abriox_action", this.abriox_action)

        this.form.patchValue({
          id: abriox_action.id,
          date: abriox_action.date,
          condition: abriox_action.condition?.name,

          images: abriox_action.images,
          documents: abriox_action.documents
        });

        this.currentState = abriox_action.status?.id;
        this.approved = abriox_action.approved;

        //this.fault_detail.clear();
        //fault_detail.map(item => this.fault_detail.push(this.formBuilder.group(item)));
        //console.log('this.fault_detail', this.fault_detail)
      },
      (err) => {}
    )
  }

  get fault_detail(): FormArray {
    return this.form.get('fault_detail') as FormArray;
  }

  addFaults(event) {
    event?.preventDefault();
    this.fault_detail.push(this.formBuilder.group({
      fault_type: '',
      fault_desc: ''
    }));
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

    const payload = {
      ...this.form.value,
      status: this.currentState,
      approved: this.approved
    };

    /**
     * Invoke the backend with a PUT request to update
     * the job with the form values.
     *
     * If create then navigate to the job id.
     */
    this.abrioxActionEntityService.update(payload).subscribe(
      (update) => {
        this.alertService.info('Saved Changes');

        if (navigate) {
          //
        }
      },

      () => {
        this.alertService.error('Something went wrong');
      }
    );
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

  onChangeState() {
    console.log("onChangeState", this.currentState);
    this.submit(false);
  }

  updateMarkState(e) {
    console.log('updateMarkState', e)
    if (e.complete) {
      this.currentState = 1;
      this.submit(true);
    }
    else if (e.approve) {
      this.approved = true;
      this.submit(true);
    }
    else if (e.refuse) {
      this.approved = false;
      this.submit(true);
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
