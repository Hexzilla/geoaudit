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
  Condition,
  TpAction,
  Status,
} from '../../../models';
import { AlertService, UploadService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';
import { ConditionEntityService } from '../../../entity-services/condition-entity.service';

@Component({
  selector: 'geoaudit-tp-action',
  templateUrl: './tp-action.component.html',
  styleUrls: ['./tp-action.component.scss'],
})
export class TpActionComponent implements OnInit, AfterViewInit {
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

  conditions: Array<Condition>;

  testpostId = 0;

  actionId = 0;

  public tp_action: TpAction = null;

  public selectedTabIndex = 0;
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private testpostEntityService: TestpostEntityService,
    private statusEntityService: StatusEntityService,
    private tpActionEntityService: TpActionEntityService,
    private conditionEntityService: ConditionEntityService,
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

    this.fetchData();
  }

  ngAfterViewInit(): void {
    //
  }

  getTestpostTitle() {
    const testpost = this.tp_action?.testpost
    if (testpost) {
      return `${testpost.reference} - ${testpost.name}`;
    }
    return 'Testpost';
  }

  fetchData() {
    this.conditionEntityService.getAll().subscribe(
      (conditions) => {
        this.conditions = conditions;
        console.log("conditions", conditions);
      }
    )

    this.testpostId = this.route.snapshot.params['id']
    this.actionId = this.route.snapshot.params['actionId'];
    console.log("actionId", this.actionId)

    this.tpActionEntityService.getByKey(this.actionId).subscribe(
      (tpaction) => {
        this.tp_action = tpaction;
        console.log("tp_action", tpaction);

        this.currentState = tpaction.status?.id;

        this.form.patchValue({
          id: tpaction.id,
          date: tpaction.date,
          condition: tpaction.condition?.id,

          images: tpaction.images,
          documents: tpaction.documents
        });

        this.fault_detail.clear();
        tpaction.fault_detail?.map(item => this.fault_detail.push(this.formBuilder.group(item)));

        this.current_drain.clear();
        tpaction.current_drain?.map(item => this.current_drain.push(this.formBuilder.group(item)));
      },
      (err) => {}
    )
  }

  getDate() {
    if (this.tp_action) {
      const datestr = moment(this.tp_action.date).format('L');
      return ` - [${datestr}]`
    }
    return ''
  }

  get anodes(): FormArray {
    return this.form.get('anodes') as FormArray;
  }

  addAnode(event) {
    event?.preventDefault();
    this.anodes.push(this.formBuilder.group({
      anodes_on: '',
      anodes_off: '',
      anodes_current: '',
    }));
  }

  get deads(): FormArray {
    return this.form.get('deads') as FormArray;
  }

  addDead(event, item=null) {
    event?.preventDefault();
    if (item) {
		  this.deads.push(this.formBuilder.group(item));
    } else {
      this.deads.push(this.formBuilder.group({
        dead_on: '',
        dead_off: '',
        dead_current: '',
      }));
    }
  }

  get sleeves(): FormArray {
    return this.form.get('sleeves') as FormArray;
  }

  addSleeve(event, item=null) {
    event?.preventDefault();
    if (item) {
		  this.sleeves.push(this.formBuilder.group(item));
    } else {
      this.sleeves.push(this.formBuilder.group({
        sleeve_on: '',
        sleeve_off: '',
        sleeve_current: '',
      }));
    }
  }

  get coupons(): FormArray {
    return this.form.get('coupons') as FormArray;
  }

  addCoupon(event, item=null) {
    event?.preventDefault();
    if (item) {
		  this.coupons.push(this.formBuilder.group(item));
    } else {
      this.coupons.push(this.formBuilder.group({
        coupon_on: '',
        coupon_off: '',
        coupon_current_ac: '',
        coupon_current_dc: '',
      }));
    }
  }

  get current_drain(): FormArray {
    return this.form.get('current_drain') as FormArray;
  }

  addCurrentDrain(event) {
    event?.preventDefault();
    this.current_drain.push(this.formBuilder.group({
      cd_input_v: '',
      cd_input_a: '',
      cd_output_v: '',
      cd_output_a: ''
    }));
  }

  get assets(): FormArray {
    return this.form.get('assets') as FormArray;
  }

  addAssets(asset) {
    if (asset) {
		  this.assets.push(this.formBuilder.group(asset));
    } else {
      this.assets.push(this.formBuilder.group({
        pipe_depth: '',
        reinstatement: ''
      }));
    }
  }

  get fault_detail(): FormArray {
    return this.form.get('fault_detail') as FormArray;
  }

  addFaults(event) {
    event?.preventDefault();
    this.fault_detail.push(this.formBuilder.group({
      type: '',
      desc: ''
    }));
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      date: [null],
      condition: [null],
      pipe_on: [null],
      pipe_off: [null],
      anodes: new FormArray([]),
      deads: new FormArray([]),
      sleeves: new FormArray([]),
      coupons: new FormArray([]),
      others_reedswitch: [null],
      others_refcell: [null],
      current_drain: new FormArray([]),
      assets: new FormArray([]),
      fault_detail: new FormArray([]),
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
     * the tp action with the form values.
     *
     * If create then navigate to the job id.
     */
    this.tpActionEntityService.update(this.form.value).subscribe(
      (update) => {
        this.alertService.info('Saved Changes');

        if (navigate) {
          const surveyId = this.tp_action?.survey?.id;
          if (surveyId) {
            const url = `/home/surveys/${surveyId}/tp_action_list`;
            this.router.navigate([url]);
          }
        }
      },

      (err) => {
        this.alertService.error('Something went wrong');
      }
    );
  }

  selectedIndexChange(selectedTabIndex) {
    this.selectedTabIndex = selectedTabIndex;
  }

  searchTestpost() {
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
