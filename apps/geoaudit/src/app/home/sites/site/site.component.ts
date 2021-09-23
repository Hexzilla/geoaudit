import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as MapActions from '../../../store/map/map.actions';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import { SiteEntityService } from '../../../entity-services/site-entity.service';
import { Site, MarkerColours, TpAction } from '../../../models';
import { debounceTime, tap, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { AlertService, UploadService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';

@Component({
  selector: 'geoaudit-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit, AfterViewInit {

  id: string;

  form: FormGroup;

  subscriptions: Array<Subscription> = [];

  color: ThemePalette = 'primary';

  @ViewChild('dateInstallationDateTimePicker') dateInstallationDateTimePicker: any;

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

  site: Site;

  tp_actions: Array<TpAction> = [];

  currentState = 3;
  approved = null;

  // surveys: Array<Survey> = [];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private surveyEntityService: SurveyEntityService,
    private siteEntityService: SiteEntityService,
    private tpActionEntityService: TpActionEntityService,
    private store: Store<fromApp.State>,
    private router: Router,
    private alertService: AlertService,
    private uploadService: UploadService,
    private dialog: MatDialog
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
    this.initialize();
  }

  ngAfterViewInit() {
    //
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    this.subscriptions.map(it => it.unsubscribe());
  }

  private initialize() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.initForm();

    if (this.id) {
      this.fetchData(this.id);
    } else {
      // this.createMode();
    }
  }

  initForm() {
    this.form = this.formBuilder.group({
      id: null,

      site_detail: this.formBuilder.group({
        owner: [''],
        region: [''],
        address: [''],
        scheme: [''],

        access_detail: [''],
        speed_limit: [''],
        distance_road: [''],
        road_condition: [''],
        tm_required: [''],
        tm_descr: [''],
        nrswa_required: [''],
        nrswa_description: [''],

        toilet: [''],
        hospital: [''],
        hazards: [''],
      }),

      reference: [''],
      name: [''],
      date_installation: [moment().toISOString()],
      site_type: [''],

      images: [],
      documents: [],
    });
  }

  fetchData(id: string) {
    this.siteEntityService.getByKey(id).subscribe(
      (site) => {
        console.log("site", site);
        this.currentState = site.status?.id;
        this.approved = site.approved;

        this.form.patchValue({
          ...site,
          site_type: site.site_type?.name
        })
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
      approved: this.approved
    }
    /**
     * Invoke the backend with a PUT request to update
     * the job with the form values.
     *
     * If create then navigate to the job id.
     */
    this.siteEntityService.update(payload).subscribe(
      () => {
        this.alertService.info('ALERTS.saved_changes');

        if (navigate) this.router.navigate([`/home/testposts`]);
      },

      () => {
        this.alertService.error('ALERTS.something_went_wrong');
      },

      () => {}
    );
  }

  clickMarker(): void {
    this.store.dispatch(
      MapActions.toggleSidebar({
        url: this.router.url,
      })
    );
  }

  getLatestConditionColour() {
    if (this.tp_actions && this.tp_actions.length > 0) {      
      const tp_action = this.tp_actions
        .filter(it => it.condition)
        .reduce((previous, current) => {
          if (!previous) return current;
          const diff = moment(previous.date).diff(moment(current.date), 'seconds')
          return (diff > 0) ? previous : current
        }, null);
      if (tp_action) {
        return MarkerColours[tp_action.condition.name];
      }
    }  
    return "00FFFFFF";
  }

  selectedIndexChange(selectedTabIndex) {
    this.selectedTabIndex = selectedTabIndex;
  }

  onNavigate(actionId) {
    console.log("onNavigate", actionId)
    this.router.navigate([`/home/tp_action/${actionId}`]);
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
