import {
  AfterViewInit,
  Component,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import {
  TrAction,
  Status,
  FaultType,
  Condition,
  NOTIFICATION_DATA
} from '../../../models';
import { AlertService, UploadService, AuthService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { TrActionEntityService } from '../../../entity-services/tr-action-entity.service';
import { RefusalModalComponent } from '../../../modals/refusal-modal/refusal-modal.component';
import { NotificationService } from '../../../services/notification.service';
import { FaultTypeEntityService } from '../../../entity-services/fault-type-entity.service';
import { ConditionEntityService } from '../../../entity-services/condition-entity.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';

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

  subscriptions: Array<Subscription> = [];

  /**
   * An array of status i.e. NOT_STARTED, ONGOING, etc.
   */
  statuses: Array<Status>;

  faultTypes: Array<FaultType>;

  conditions: Array<Condition>;

  /**
   * The current job state.
   */
  currentState = 3;

  approved = false;

  approved_by = 0;

  /**
   * Whether the form has been submitted.
   */
  submitted = false;

  id;

  surveyId: string;

  public tr_action: TrAction = null;

  public selectedTabIndex = 0;

  private unsubscribe = new Subject<void>();
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

  constructor(
    private authService: AuthService,
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
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) {
    this.subscriptions.push(this.route.queryParams.subscribe(params => {
      const tabIndex = params['tab'];
      if (tabIndex == 'actions') {
        this.selectedTabIndex = 2;
      } else if (tabIndex == 'notes') {
        this.selectedTabIndex = 3;
      } else {
        this.selectedTabIndex = 0;
      }
    }));

    this.subscriptions.push(this.route.params.subscribe(() => {
      this.initialize();
    }));
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    //this.initialize();
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    this.subscriptions.map(it => it.unsubscribe());
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngAfterViewInit(): void {
    //
  }

  private initialize() {
    this.id = this.route.snapshot.params['id'];
    this.surveyId = this.route.snapshot.queryParams['survey'];
    console.log("id", this.id, this.surveyId)

    // Fetch statuses
    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.statuses = statuses;
      },
    );

    this.faultTypeEntityService.getAll().subscribe((faultTypes) => {
      this.faultTypes = faultTypes;
    })

    this.conditionEntityService.getAll().subscribe((conditions) => {
      this.conditions = conditions
    });

    this.initRoutes();

    /**
     * Initialise the form with properties and validation
     * constraints.
     */
    this.initialiseForm();

    if (this.id && this.id != 'create') {
      this.fetchData(this.id);
    } else {
      this.createMode();
    }
  }

  createMode() {
    const payload = {
      ...this.form.value,
      survey: this.surveyId
    }
    this.trActionEntityService.add(payload).subscribe(
      (item) => {
        this.form.patchValue(item);
        /*this.router
          .navigate([`/home/tr_actions/${this.form.value.id}`], {
            queryParams: { survey: this.surveyId }
          })
          .then(() => {
            window.location.reload();
          });*/
      }
    );
  }
  
  fetchData(actionId) {
    this.trActionEntityService.getByKey(actionId).subscribe(
      (tr_action) => {
        this.tr_action = tr_action;
        //console.log("trs.tr_action", tr_action)

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
  
  initRoutes() {
    this.route.queryParams.subscribe(params => {
      const tabIndex = params['tab'];
      if (tabIndex == 'actions') {
        this.selectedTabIndex = 2;
      } else if (tabIndex == 'notes') {
        this.selectedTabIndex = 3;
      } else {
        this.selectedTabIndex = 0;
      }
    });
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      date: [moment().toISOString(), Validators.required],
      condition: [null, Validators.required],
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
      approved: this.approved,
      approved_by: this.approved_by,
    };

    /**
     * Invoke the backend with a PUT request to update
     */
    this.trActionEntityService.update(payload).subscribe(
      () => {
        this.alertService.info('Saved Changes');
        if (navigate) {
          const url = `/home/surveys/${this.surveyId}/tr_action_list`;
          this.router.navigate([url]);
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

  getItemTitle() {
    const item = this.tr_action?.tr
    if (item) {
      return `${item.reference} - ${item.name}`;
    }
    return 'Tr';
  }

  navigate() {
    const item = this.tr_action?.tr
    if (item) {
      this.router.navigate([`/home/trs/${item.id}`]);
    }
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
      this.approved_by = this.authService.authValue.user.id
      this.submit(true);
    }
    else if (e.refuse) {
      this.refuse();
    }
  }

  private refuse() {
    const dialogRef = this.dialog.open(RefusalModalComponent, {
    });

    dialogRef.afterClosed().subscribe((result) => {
      const data: NOTIFICATION_DATA = {
        type: 'TR_REFUSAL',
        subject: this.tr_action,
        message: result.message,
      };
      
      this.notificationService.post({
        source: this.authService.authValue.user,
        recipient: null,
        data
      }).subscribe()

      this.approved = false;
      this.approved_by = 0;
      this.submit(true);
    });
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
