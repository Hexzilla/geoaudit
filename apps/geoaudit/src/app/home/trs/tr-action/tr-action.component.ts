import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import {
  Testpost,
  TrAction,
  Status,
} from '../../../models';
import { AlertService, UploadService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { TrActionEntityService } from '../../../entity-services/tr-action-entity.service';

@Component({
  selector: 'geoaudit-tp-action',
  templateUrl: './tr-action.component.html',
  styleUrls: ['./tr-action.component.scss'],
})
export class TrActionComponent implements OnInit, AfterViewInit {
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

  actionId = 0;

  public tr_action: TrAction = null;

  public selectedTabIndex = 0;
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private statusEntityService: StatusEntityService,
    private trActionEntityService: TrActionEntityService,
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

    this.fetchTpAction();
  }

  ngAfterViewInit(): void {
    //
  }

  fetchTpAction() {
    this.actionId = this.route.snapshot.params['actionId'];
    console.log("actionId", this.actionId)

    this.trActionEntityService.getByKey(this.actionId).subscribe(
      (tr_action) => {
        this.tr_action = tr_action;

        //TODO - FormArray
        this.form.patchValue({
          date: moment(tr_action.date).format('L LT'),
          condition: tr_action.condition?.name,

          images: tr_action.images,
          documents: tr_action.documents
        });

        this.currentState = tr_action.status?.id;
        this.approved = tr_action.approved;

      },
      (err) => {}
    )
  }

  get anodes(): FormArray {
    return this.form.get('anodes') as FormArray;
  }

  addAnode(anode) {
    if (anode) {
		  this.anodes.push(this.formBuilder.group(anode));
    } else {
      this.anodes.push(this.formBuilder.group({
        anodes_on: '',
        anodes_off: '',
        anodes_current: '',
      }));
    }
  }

  get currentDrains(): FormArray {
    return this.form.get('currentDrains') as FormArray;
  }

  addCurrentDrain(drain) {
    if (drain) {
		  this.currentDrains.push(this.formBuilder.group(drain));
    } else {
      this.currentDrains.push(this.formBuilder.group({
        cd_input_v: '',
        cd_input_a: '',
        cd_output_v: '',
        cd_output_a: ''
      }));
    }
  }
  
  get faults(): FormArray {
    return this.form.get('faults') as FormArray;
  }

  addFaults(fault) {
    if (fault) {
		  this.faults.push(this.formBuilder.group(fault));
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
      reading_volt: null,
      reading_amps: null,
      current_setting: null,
      anodes: new FormArray([]),
      currentDrains: new FormArray([]),
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

    const payload = {
      ...this.form.value,
      status: this.currentState,
      approved: this.approved
    };

    /**
     * Invoke the backend with a PUT request to update
     */
    this.trActionEntityService.update(payload).subscribe(
      () => {
        this.alertService.info('Saved Changes');
        if (navigate) this.router.navigate([`/home/trs`]);
      },
      () => {
        this.alertService.error('Something went wrong');
      }
    );
  }

  selectedIndexChange(selectedTabIndex) {
    this.selectedTabIndex = selectedTabIndex;
  }
  
  completed() {
    //return this.tp_action?.status?.name == Statuses.COMPLETED;
    return this.currentState == 1
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
