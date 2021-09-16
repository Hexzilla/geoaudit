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
  TrAction,
  Status,
  FaultType,
  Condition
} from '../../../models';
import { AlertService, UploadService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { TrActionEntityService } from '../../../entity-services/tr-action-entity.service';
import { FaultTypeEntityService } from '../../../entity-services/fault-type-entity.service';
import { ConditionEntityService } from '../../../entity-services/condition-entity.service';

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

  faultTypes: Array<FaultType>;

  conditions: Array<Condition>;

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
    private faultTypeEntityService: FaultTypeEntityService,
    private conditionEntityService: ConditionEntityService,
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

    this.faultTypeEntityService.getAll().subscribe((faultTypes) => {
      this.faultTypes = faultTypes;
    })

    this.conditionEntityService.getAll().subscribe((conditions) => {
      this.conditions = conditions
    });

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

    this.trActionEntityService.getByKey(this.actionId).subscribe(
      (tr_action) => {
        this.tr_action = tr_action;
        console.log("trs.tr_action", tr_action)

        this.currentState = tr_action.status?.id;
        this.approved = tr_action.approved;

        this.form.patchValue({
          ...tr_action,
          condition: tr_action.condition?.id,
        });

        this.anodes.clear();
        tr_action.tr_readings?.groundbed?.map(it => {
          const anode = {
            anode_off: it.anode_off,
            anode_current: it.anode_current,
          }
          this.anodes.push(this.formBuilder.group(anode))
        });

        this.current_drain.clear();
        tr_action.current_drain?.map(item => this.current_drain.push(this.formBuilder.group(item)));

        this.fault_detail.clear();
        tr_action.fault_detail?.map(item => {
          const fault = {
            fault_type: item.fault_type?.id,
            fault_desc: item.fault_desc
          }
          this.fault_detail.push(this.formBuilder.group(fault))
        });
      },
      (err) => {}
    )
  }

  get anodes(): FormArray {
    return this.form.get('anodes') as FormArray;
  }

  addAnode(event) {
    event?.preventDefault();
    this.anodes.push(this.formBuilder.group({
      anode_off: '',
      anode_current: '',
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

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      id: null,
      date: null,
      condition: null,
      tr_readings: this.formBuilder.group({
        Amps: null,
        Volt: null,
        current_settings: null,
      }),
      anodes: new FormArray([]),
      current_drain: new FormArray([]),
      fault_detail: new FormArray([]),
    });
  }

  submit(navigate = true) {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
      this.alertService.error('ALERTS.invalid');
      return;
    }

    const payload = {
      ...this.form.value,
      tr_readings: {
        ...this.form.value.tr_readings,
        groundbed: this.form.value.anodes,
      },
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
    this.submit(false);
  }

  updateMarkState(e) {
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