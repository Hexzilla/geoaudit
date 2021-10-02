import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import {
  FaultType,
  AbrioxAction,
  Status,
  Condition,
  NOTIFICATION_DATA,
} from '../../../models';
import { AlertService, UploadService, AuthService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { AbrioxActionEntityService } from '../../../entity-services/abriox-action-entity.service';
import { FaultTypeEntityService } from '../../../entity-services/fault-type-entity.service';
import { ConditionEntityService } from '../../../entity-services/condition-entity.service';
import { Subscription } from 'rxjs';
import { RefusalModalComponent } from '../../../modals/refusal-modal/refusal-modal.component';
import { NotificationService } from '../../../services/notification.service';

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

  subscriptions: Array<Subscription> = [];

  /**
   * An array of status i.e. NOT_STARTED, ONGOING, etc.
   */
  statuses: Array<Status>;

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

  faultTypes: Array<FaultType>;

  conditions: Array<Condition>;

  actionId = 0;

  public abriox_action: AbrioxAction = null;

  public selectedTabIndex = 0;
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private statusEntityService: StatusEntityService,
    private abrioxActionEntityService: AbrioxActionEntityService,
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

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngAfterViewInit(): void {
    //
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    this.subscriptions.map(it => it.unsubscribe());
  }

  private initialize(): void {
    // Fetch statuses
    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.statuses = statuses;
        console.log("statuses", statuses);
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

    this.fetchData();
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
   initialiseForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      date: [null, Validators.required],
      condition: [null, Validators.required],
      fault_detail: new FormArray([]),
    });
  }

  fetchData() {
    this.actionId = this.route.snapshot.params['actionId'];
    this.abrioxActionEntityService.getByKey(this.actionId).subscribe(
      (abriox_action) => {
        this.abriox_action = abriox_action;
        console.log("abriox_action", this.abriox_action)

        this.form.patchValue({
          ...abriox_action,
          condition: abriox_action.condition?.id,
        });

        this.currentState = abriox_action.status?.id;
        this.approved = abriox_action.approved;

        //this.fault_detail.clear();
        //abriox_action.fault_detail?.map(item => this.fault_detail.push(this.formBuilder.group(item)));
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
      this.refrush();
    }
  }

  private refrush() {
    const dialogRef = this.dialog.open(RefusalModalComponent, {
    });

    dialogRef.afterClosed().subscribe((result) => {
      const data: NOTIFICATION_DATA = {
        type: 'ABRIOX_ACTION_REFUSAL',
        subject: this.abriox_action,
        message: result.message,
      };
      
      this.notificationService.post({
        source: this.authService.authValue.user,
        recipient: null,
        data
      }).subscribe()

      this.approved = false;
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
