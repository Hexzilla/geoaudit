import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { State, Store } from '@ngrx/store';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import {
  Condition,
  FaultType,
  ReferenceCell,
  TpAction,
  Status,
  Statuses,
} from '../../../models';
import { AlertService, UploadService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';
import { ConditionEntityService } from '../../../entity-services/condition-entity.service';
import { FaultTypeEntityService } from '../../../entity-services/fault-type-entity.service';
import { ReferenceCellEntityService } from '../../../entity-services/reference-cell-entity.service';

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

  approved = false;

  /**
   * Whether the form has been submitted.
   */
  submitted = false;

  conditions: Array<Condition>;

  faultTypes: Array<FaultType>;

  referenceCells: Array<ReferenceCell>

  testpostId = 0;

  actionId = 0;

  public tp_action: TpAction = null;

  public selectedTabIndex = 0;
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private statusEntityService: StatusEntityService,
    private tpActionEntityService: TpActionEntityService,
    private conditionEntityService: ConditionEntityService,
    private faultTypeEntityService: FaultTypeEntityService,
    private referenceCellEntityService: ReferenceCellEntityService,
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

  getTestpostTitle() {
    const testpost = this.tp_action?.testpost
    if (testpost) {
      return `${testpost.reference} - ${testpost.name}`;
    }
    return 'Testpost';
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
      anodes_off: [null],
      anode_on: [null],
      anodes_current: [null],
      anode: new FormArray([]),
      dead: new FormArray([]),
      sleeve: new FormArray([]),
      coupon: new FormArray([]),
      others_reedswitch: [null],
      others_refcell: [null],
      current_drain: new FormArray([]),
      pipe_depth: [null],
      reinstatement: [null],
      fault_detail: new FormArray([]),
    });
  }

  fetchData() {
    this.conditionEntityService.getAll().subscribe(
      (conditions) => {
        this.conditions = conditions;
        console.log("conditions", conditions);
      }
    )
    this.faultTypeEntityService.getAll().subscribe(
      (faultTypes) => {
        this.faultTypes = faultTypes;
        console.log("faultTypes", faultTypes);
      }
    )
    this.referenceCellEntityService.getAll().subscribe(
      (referenceCells) => {
        this.referenceCells = referenceCells;
        console.log("referenceCells", referenceCells);
      }
    )

    this.testpostId = this.route.snapshot.params['id']
    this.actionId = this.route.snapshot.params['actionId'];
    console.log("actionId", this.actionId)

    this.tpActionEntityService.getByKey(this.actionId).subscribe(
      (tpaction) => {
        this.tp_action = tpaction;
        console.log("tp_action", tpaction);

        this.form.patchValue({
          ...tpaction,
          condition: tpaction.condition?.id,
        });

        this.currentState = tpaction.status?.id;
        this.approved = tpaction.approved;

        if (tpaction.tp_information) {
          const info = tpaction.tp_information;

          this.anode.clear();
          info.anode?.map(item => this.anode.push(this.formBuilder.group(item)));

          this.sleeve.clear();
          info.sleeve?.map(item => this.sleeve.push(this.formBuilder.group(item)));
          
          this.coupon.clear();
          info.coupon?.map(item => this.coupon.push(this.formBuilder.group(item)));
          
          this.dead.clear();
          info.dead?.map(item => this.dead.push(this.formBuilder.group(item)));
        }

        this.fault_detail.clear();
        tpaction.fault_detail?.map(item => this.fault_detail.push(this.formBuilder.group(item)));

        this.current_drain.clear();
        tpaction.current_drain?.map(item => this.current_drain.push(this.formBuilder.group(item)));
      },
      (err) => {}
    )
  }

  getReference() {
    if (this.tp_action) {
      const datestr = moment(this.tp_action.date).format('L');
      return `[${datestr}]`
    }
    return ''
  }

  get anode(): FormArray {
    return this.form.get('anode') as FormArray;
  }

  addAnode(event) {
    event?.preventDefault();
    this.anode.push(this.formBuilder.group({
      anode_off: '',
      anode_current: '',
    }));
  }

  get dead(): FormArray {
    return this.form.get('dead') as FormArray;
  }

  addDead(event) {
    event?.preventDefault();
    this.dead.push(this.formBuilder.group({
      dead_on: '',
      dead_off: '',
      dead_current: '',
    }));
  }

  get sleeve(): FormArray {
    return this.form.get('sleeve') as FormArray;
  }

  addSleeve(event) {
    event?.preventDefault();
    this.sleeve.push(this.formBuilder.group({
      sleeve_on: '',
      sleeve_off: '',
      sleeve_current: '',
    }));
  }

  get coupon(): FormArray {
    return this.form.get('coupon') as FormArray;
  }

  addCoupon(event) {
    event?.preventDefault();
    this.coupon.push(this.formBuilder.group({
      coupon_on: null,
      coupon_off: null,
      coupon_current_ac: null,
      coupon_current_dc: null,
    }));
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
      approved: this.approved,
      tp_information: {
        anodes_off: this.form.value.anodes_off,
        anode_on: this.form.value.anode_on,
        anodes_current: this.form.value.anodes_current,
        anode: this.form.value.anode,
        dead: this.form.value.dead,
        sleeve: this.form.value.sleeve,
        coupon: this.form.value.coupon,
      }
    };

    delete payload.anode;
    delete payload.dead;
    delete payload.sleeve;
    delete payload.coupon;

    /**
     * Invoke the backend with a PUT request to update
     * the tp action with the form values.
     *
     * If create then navigate to the job id.
     */
    this.tpActionEntityService.update(payload).subscribe(
      () => {
        this.alertService.info('Saved Changes');

        if (navigate) {
          const surveyId = this.tp_action?.survey?.id;
          if (surveyId) {
            const url = `/home/surveys/${surveyId}/tp_action_list`;
            this.router.navigate([url]);
          }
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

  searchTestpost() {
    this.router.navigate([`/home/search`]);
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
