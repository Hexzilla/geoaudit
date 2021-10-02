import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as MapActions from '../../../store/map/map.actions';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import { TrEntityService } from '../../../entity-services/tr-entity.service';
import { Abriox, NOTIFICATION_DATA, MarkerColours, Tr, TrAction } from '../../../models';
import { debounceTime, tap, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { AlertService, UploadService, AuthService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { TrActionEntityService } from '../../../entity-services/tr-action-entity.service';
import { RefusalModalComponent } from '../../../modals/refusal-modal/refusal-modal.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'geoaudit-tr',
  templateUrl: './tr.component.html',
  styleUrls: ['./tr.component.scss']
})
export class TrComponent implements OnInit, AfterViewInit {

  id: string;

  form: FormGroup;
  
  subscriptions: Array<Subscription> = [];

  color: ThemePalette = 'primary';

  @ViewChild('dateInstallationDateTimePicker') dateInstallationDateTimePicker: any;

  @ViewChild('latCtrlInput') latCtrlInput: ElementRef;
  @ViewChild('lngCtrlInput') lngCtrlInput: ElementRef;

  latCtrl = new FormControl();

  lngCtrl = new FormControl();

  public selectedTabIndex = 0;
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

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

  private unsubscribe = new Subject<void>();

  API_URL: string;

  abriox: Abriox;

  tr: Tr;

  tr_actions: Array<TrAction> = [];

  currentState = 3;
  approved = null;
  approved_by = 0;

  // surveys: Array<Survey> = [];

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private trEntityService: TrEntityService,
    private trActionEntityService: TrActionEntityService,
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

  ngOnInit(): void {
    //this.initialize();
  }

  ngAfterViewInit() {
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

  private initialize() {
    this.API_URL = environment.API_URL;
    this.id = this.route.snapshot.paramMap.get('id');

    this.initForm();

    if (this.id) {
      this.getTestpostAndPatchForm(this.id);
    } else {
      // this.createMode();
    }

    this.store.select('map').subscribe((map) => {
      if (map.clickMarker) {
        this.latCtrl.setValue(map.clickMarker.lat);
        this.lngCtrl.setValue(map.clickMarker.lng);
      }
    });
  }

  initForm() {
    this.form = this.formBuilder.group({

      reference: ['', Validators.required],
      name: ['', Validators.required],
      date_installation: [moment().toISOString()],
      manufacture: [''],
      model: [''],
      serial_number: [''],

      geometry: [null, Validators.required],

      images: [],
      documents: [],


      // datetime: moment().toISOString(),
      // description: null,
      // images: [[]],
      // attachments: [[]],

      // assignees: [],

      // abrioxes: [],
      // jobs: [],
      // resistivities: [],
      // sites: [],
      // surveys: [],
      // testposts: [],
      // trs: [],

      id: null, // Whilst we don't edit the id, we submit the form.
    });
  }

  getTestpostAndPatchForm(id: string) {
    this.trEntityService.getByKey(id).subscribe(
      (tr) => {
        this.patchForm(tr);

        this.currentState = tr.status?.id;
        this.approved = tr.approved;
        this.abriox = tr.abriox;

        console.log("tr_action----tr.tr_actions", tr.tr_actions)
        tr.tr_actions.map(tr_action => {
          this.trActionEntityService.getByKey(tr_action.id).subscribe(item => {
            console.log("tr_action~~~~~~~~~~~~", tr_action.id, item)
            this.tr_actions.push(item)
            this.tr_actions.sort((a, b) => moment(a.date).diff(moment(b.date), 'seconds'))
            // this.surveyEntityService.getByKey(item.survey.id).subscribe(survey => {
            //   this.surveys.push(survey);
            // })
          })
        })

        this.tr = tr;
        this.autoSave(this.id ? false : true);
      },

      (err) => {}
    )
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
            .navigate([`/home/testposts/${this.form.value.id}`])
            .then(() => {
              window.location.reload();
            });
        }
      });
  }

  submit(navigate = true) {
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
      approved_by: this.approved_by,
    }
    /**
     * Invoke the backend with a PUT request to update
     * the job with the form values.
     *
     * If create then navigate to the job id.
     */
    this.trEntityService.update(payload).subscribe(
      (update) => {
        this.alertService.info('ALERTS.saved_changes');

        if (navigate) this.router.navigate([`/home`]);
      },

      (err) => {
        this.alertService.error('ALERTS.something_went_wrong');
      },
    );
  }

  patchForm(tr: Tr) {
    const {
      id,

      reference,
      name,
      date_installation,
      serial_number,
      geometry,
    
      images,
      documents
    } = tr;

    this.form.patchValue({
      id,

      reference,
      name,
      date_installation,
      serial_number,
      geometry,

      images,
      documents
    })

    if (geometry) {
      this.latCtrl.setValue(geometry['lat']);
      this.lngCtrl.setValue(geometry['lng']);
    }
  }

  clickMarker(): void {
    this.store.dispatch(
      MapActions.toggleSidebar({
        url: this.router.url,
      })
    );
  }

  addAbriox() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        tr: this.form.value.id
      }
    }
    this.router.navigate(["/home/abrioxes/create"], navigationExtras)
  }

  getLatestConditionColour() {
    if (this.tr_actions && this.tr_actions.length > 0) {      
      const tr_action = this.tr_actions
        .filter(it => it.condition)
        .reduce((previous, current) => {
          if (!previous) return current;
          const diff = moment(previous.date).diff(moment(current.date), 'seconds')
          return (diff > 0) ? previous : current
        }, null);
      if (tr_action) {
        return MarkerColours[tr_action.condition.name];
      }
    }  
    return "00FFFFFF";
  }

  selectedIndexChange(selectedTabIndex) {
    this.selectedTabIndex = selectedTabIndex;
  }

  onNavigate(actionId) {
    this.router.navigate([`/home/trs/${this.tr.id}/tr_action/${actionId}`]);
  }

  searchTestpost() {
    this.router.navigate([`/home/search`]);
  }
  
  getDetailInfo() {
    if (this.tr) {
      return `${this.tr.reference} - ${this.tr.name}`;
    }
    return 'Tr';
  }

  completed() {
    //return this.tp_action?.status?.name == Statuses.COMPLETED;
    return this.currentState == 1
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
        type: 'TR_REFUSAL',
        subject: this.tr,
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
