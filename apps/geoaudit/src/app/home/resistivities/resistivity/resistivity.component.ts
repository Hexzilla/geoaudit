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
import {
  Resistivity,
  Status,
} from '../../../models';
import * as moment from 'moment';
import * as MapActions from '../../../store/map/map.actions';
import { AlertService, UploadService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { ResistivityEntityService } from '../../../entity-services/resistivity-entity.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'geoaudit-resistivity',
  templateUrl: './resistivity.component.html',
  styleUrls: ['./resistivity.component.scss'],
})
export class ResistivityComponent implements OnInit, AfterViewInit {
  id: string;
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
  currentState = 0;

  approved = false;

  /**
   * Whether the form has been submitted.
   */
  submitted = false;

  public resistivity: Resistivity = null;

  public selectedTabIndex = 0;
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

  latCtrl = new FormControl();
  lngCtrl = new FormControl();

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private statusEntityService: StatusEntityService,
    private resistivityEntityService: ResistivityEntityService,
    private store: Store<fromApp.State>,
    private router: Router,
    private alertService: AlertService,
    private uploadService: UploadService,
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

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    this.subscriptions.map(it => it.unsubscribe());
  }

  ngAfterViewInit(): void {
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
    this.id = this.route.snapshot.paramMap.get('id');

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

    this.store.select('map').subscribe((map) => {
      if (map.clickMarker) {
        this.latCtrl.setValue(map.clickMarker.lat);
        this.lngCtrl.setValue(map.clickMarker.lng);
      }
    });

    if (this.id && this.id != 'create') {
      this.fetchData(this.id);
    } else {
      this.createMode();
    }
  }

  createMode() {
    this.resistivityEntityService.add(this.form.value).subscribe(
      (resistivity) => {
        this.patchForm(resistivity);
      },

      (err) => {}
    );
  }

  fetchData(id) {
    this.resistivityEntityService.getByKey(id).subscribe(
      (resistivity) => {
        this.resistivity = resistivity;
        this.patchForm(resistivity)
      },
      (err) => {}
    )
  }

  private patchForm(resistivity) {
    this.currentState = resistivity.status?.id;
    this.approved = resistivity.approved;
    const geometry = resistivity.geometry;

    this.form.patchValue({
      id: resistivity.id,
      date: resistivity.date,
      reference: resistivity.reference,
      geometry: geometry,
      
      images: resistivity.images,
      documents: resistivity.documents
    });

    if (geometry) {
      this.latCtrl.setValue(geometry['lat']);
      this.lngCtrl.setValue(geometry['lng']);
    }

    this.resistivity_detail.clear();
    resistivity.resistivity_detail?.map(item => {
      this.resistivity_detail.push(this.formBuilder.group(item));
    });
  }

  get resistivity_detail(): FormArray {
    return this.form.get('resistivity_detail') as FormArray;
  }

  addResistivityDetail(e) {
    e?.preventDefault();
    this.resistivity_detail.push(this.formBuilder.group({
      distance: '',
      value: '',
    }));
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      date: [moment().toISOString()],
      reference: [null],
      geometry: [null],
      resistivity_detail: new FormArray([]),
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
      approved: this.approved,
    };

    /**
     * Invoke the backend with a PUT request to update
     * the resistivity with the form values.
     *
     * If create then navigate to the job id.
     */
    this.resistivityEntityService.update(payload).subscribe(
      () => {
        this.alertService.info('Saved Changes');
        if (navigate) this.router.navigate([`/home/resistivities`]);
      },
      (err) => {
        console.error(err);
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

  clickMarker(): void {
    this.store.dispatch(
      MapActions.toggleSidebar({
        url: this.router.url,
      })
    );
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
