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
  Resistivity,
  Status,
} from '../../../models';
import * as MapActions from '../../../store/map/map.actions';
import { AlertService, UploadService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { ResistivityEntityService } from '../../../entity-services/resistivity-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';

@Component({
  selector: 'geoaudit-resistivity',
  templateUrl: './resistivity.component.html',
  styleUrls: ['./resistivity.component.scss'],
})
export class ResistivityComponent implements OnInit, AfterViewInit {
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

  resistivityId = 0;

  public resistivity: Resistivity = null;

  public selectedTabIndex = 0;
  
  attachedImages: Array<any>;
  attachedDocuments: Array<any>;

  latCtrl = new FormControl();
  lngCtrl = new FormControl();

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private surveyEntityService: SurveyEntityService,
    private testpostEntityService: TestpostEntityService,
    private statusEntityService: StatusEntityService,
    private resistivityEntityService: ResistivityEntityService,
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

    this.store.select('map').subscribe((map) => {
      if (map.clickMarker) {
        this.latCtrl.setValue(map.clickMarker.lat);
        this.lngCtrl.setValue(map.clickMarker.lng);
      }
    });

    this.fetchData();
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

  fetchData() {
    this.resistivityId = this.route.snapshot.params['id']
    console.log("resistivityId", this.resistivityId)

    this.resistivityEntityService.getByKey(this.resistivityId).subscribe(
      (resistivity) => {
        this.resistivity = resistivity;
        console.log("resistivity", this.resistivity)
        
        this.currentState = resistivity.status.id;
        const geometry = resistivity.geometry;

        this.form.patchValue({
          id: resistivity.id,
          date: resistivity.date,
          reference: resistivity.reference,
          geometry: geometry,
          
          images: resistivity.images,
          documents: resistivity.documents
        });

        this.latCtrl.setValue(geometry['lat']);
        this.lngCtrl.setValue(geometry['lng']);

        this.resistivity_detail.clear();
        resistivity.resistivity_detail?.map(item => {
          this.resistivity_detail.push(this.formBuilder.group(item));
        });
      },
      (err) => {}
    )
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
      date: [null],
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

    console.log("this.form.value", this.form.value);
    /**
     * Invoke the backend with a PUT request to update
     * the resistivity with the form values.
     *
     * If create then navigate to the job id.
     */
    this.resistivityEntityService.update(this.form.value).subscribe(
      () => {
        this.alertService.info('Saved Changes');
        //if (navigate) this.router.navigate([`/home/jobs`]);
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
