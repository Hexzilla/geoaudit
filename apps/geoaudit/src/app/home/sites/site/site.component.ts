import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import * as MapActions from '../../../store/map/map.actions';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import { SiteEntityService } from '../../../entity-services/site-entity.service';
import { SiteTypeEntityService } from '../../../entity-services/site-type-entity.service';
import { Site, SiteAction, NOTIFICATION_DATA, SiteActionColours, SiteType, User, Hazard } from '../../../models';
import { debounceTime, tap, distinctUntilChanged, takeUntil, map, filter } from 'rxjs/operators';
import { fromEvent,Subject, Subscription } from 'rxjs';
import { AlertService, UploadService, AuthService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { RefusalModalComponent } from '../../../modals/refusal-modal/refusal-modal.component';
import { NotificationService } from '../../../services/notification.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserEntityService } from '../../../entity-services/user-entity.service';
import { HazardEntityService } from '../../../entity-services/hazard-entity.service';

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

  site_types: Array<SiteType>;

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

  @ViewChild('hazardInput') hazardInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  hazardControl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredHazards: Array<Hazard>;
  hazards: Array<Hazard> = [];
  allHazards: Array<Hazard> = [];

  site: Site;

  currentState = 3;
  approved = null;
  approved_by = 0;

  constructor(
    private authService: AuthService, 
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private siteEntityService: SiteEntityService,
    private store: Store<fromApp.State>,
    private router: Router,
    private alertService: AlertService,
    private uploadService: UploadService,
    private notificationService: NotificationService,
    private siteTypeEntityService: SiteTypeEntityService,
    private userEntityService: UserEntityService,
    private hazardEntityService: HazardEntityService,
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

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    //this.initialize();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngAfterViewInit() {
    /**
     * Used for filtering users (assignees) on a given
     * input text filter.
     */
     fromEvent(this.hazardInput.nativeElement, 'keyup')
     .pipe(
       map((event: any) => {
         return event.target.value;
       }),
       filter((res) => res.length >= 0),
       distinctUntilChanged()
     )
     .subscribe((text: string) => {
       this.filteredHazards = this.filterHazard(text);
     });
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    this.subscriptions.map(it => it.unsubscribe());
  }

  private initialize() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.siteTypeEntityService.getAll().subscribe((items) => {
      this.site_types = items;
      console.log("this.site_types", this.site_types);
    })

    // Fetch hazards
    this.hazardEntityService.getAll().subscribe((hazards) => {
      this.allHazards = hazards;
      console.log("hazards", hazards);
    })

    this.initForm();

    if (this.id && this.id != 'create') {
      this.fetchData(this.id);
    } else {
      this.createMode();
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
        speed_limit: [0],
        distance_road: [''],
        road_condition: [''],
        tm_required: [false],
        tm_descr: [''],
        nrswa_required: [false],
        nrswa_description: [''],

        toilet: [''],
        hospital: [''],
        hazard: [''],
      }),

      reference: ['', Validators.required],
      name: ['', Validators.required],
      date_installation: [moment().toISOString()],
      site_type: [''],

      images: [],
      documents: [],
    });
  }

  createMode() {
    this.siteEntityService.add(this.form.value).subscribe(
      (site) => {
        this.form.patchValue(site);
        this.autoSave(true);
      }
    );
  }

  fetchData(id: string) {
    this.siteEntityService.getByKey(id).subscribe(
      (site) => {
        console.log("site", site);
        this.site = site;
        this.currentState = site.status?.id;
        this.approved = site.approved;

        site.site_detail.hazard?.map((hazard) => {
          if (!this.hazards.find((item) => item.id === hazard.id)) {
            const item = this.allHazards.find((item) => item.id == hazard.id)
            item && this.hazards.push(item);
          }
        });

        this.form.patchValue({
          ...site,
          site_type: site.site_type?.id
        })
      },
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
            .navigate([`/home/sites/${this.form.value.id}`])
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

        if (navigate) this.router.navigate([`/home`]);
      },
      () => {
        this.alertService.error('ALERTS.something_went_wrong');
      },
    );
  }

  clickMarker(): void {
    this.store.dispatch(
      MapActions.toggleSidebar({
        url: this.router.url,
      })
    );
  }

  selectedIndexChange(selectedTabIndex) {
    this.selectedTabIndex = selectedTabIndex;
  }

  onActionNavigation(action) {
    this.router.navigate([`/home/sites/${this.site.id}/site_action/${action.id}`]);
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
      this.refuse();
    }
  }

  private refuse() {
    const dialogRef = this.dialog.open(RefusalModalComponent, {
    });

    dialogRef.afterClosed().subscribe((result) => {
      const data: NOTIFICATION_DATA = {
        type: 'SITE_REFUSAL',
        subject: this.site,
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

  getActionIconColor(action: SiteAction) {
    if (action.site_status == 1) {
      return SiteActionColours.ACCESSIBLE;
    } else if (action.site_status == 2) {
      return SiteActionColours.BAD_WORKING_ORDER;
    } else if (action.site_status == 3) {
      return SiteActionColours.CLEARANCE_REQUIRED;
    } else if (action.site_status == 4) {
      return SiteActionColours.INACCESSIBLE;
    } else if (action.site_status == 5) {
      return SiteActionColours.REQUIRES_INTERVENTION;
    }
    return "00FFFFFF";
  }

  addHazard(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our user
    if (value) {
      const filterAllUsersOnValue = this.filterHazard(value);
      if (filterAllUsersOnValue.length >= 1) {
        this.hazards.push(filterAllUsersOnValue[0]);
      }
    }

    // Clear the input value
    this.hazardInput.nativeElement.value = '';
    this.hazardControl.setValue(null);
    this.hazardsChange();
  }

  removeHazard(hazard: Hazard): void {
    const exists = this.hazards.find((item) => item.id === hazard.id);
    if (exists) {
      this.hazards = this.hazards.filter((item) => item.id !== exists.id);
    }
    this.hazardsChange();
  }

  private filterHazard(value: string): Array<Hazard> {
    const filterValue = value.toLowerCase();
    return this.allHazards.filter((hazard) => {
      return (
        hazard.name.toLowerCase().indexOf(filterValue) === 0
      );
    });
  }

  hazardsChange(): void {
    this.form.patchValue({
      site_detail: {
        ...this.form.value.site_detail,
        hazard: this.hazards,
      }
    });
  }

  hazardSelected(event: MatAutocompleteSelectedEvent): void {
    this.hazards.push(event.option.value);
    this.hazardInput.nativeElement.value = '';
    this.hazardControl.setValue(null);
    this.hazardsChange();
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
