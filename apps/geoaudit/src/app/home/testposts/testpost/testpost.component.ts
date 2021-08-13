import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as MapActions from '../../../store/map/map.actions';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { Image, Testpost } from '../../../models';
import { debounceTime, tap, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AlertService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { AttachmentModalComponent } from '../../../modals/attachment-modal/attachment-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'apps/geoaudit/src/environments/environment';

@Component({
  selector: 'geoaudit-testpost',
  templateUrl: './testpost.component.html',
  styleUrls: ['./testpost.component.scss']
})
export class TestpostComponent implements OnInit, AfterViewInit {

  id: string;

  form: FormGroup;

  color: ThemePalette = 'primary';

  @ViewChild('dateInstallationDateTimePicker') dateInstallationDateTimePicker: any;

  @ViewChild('latCtrlInput') latCtrlInput: ElementRef;
  @ViewChild('lngCtrlInput') lngCtrlInput: ElementRef;

  latCtrl = new FormControl();

  lngCtrl = new FormControl();

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

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private testpostEntityService: TestpostEntityService,
    private store: Store<fromApp.State>,
    private router: Router,
    private alertService: AlertService,
    private _lightbox: Lightbox,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
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

  initForm() {
    this.form = this.formBuilder.group({

      reference: [''],
      name: [''],
      date_installation: [moment().toISOString()],
      manufacture: [''],
      model: [''],
      serial_number: [''],

      geometry: [null],

      abrioxes: [[]],

      footer: [{
        images: [],
        documents: []
      }],


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
    this.testpostEntityService.getByKey(id).subscribe(
      (testpost) => {
        this.patchForm(testpost);

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
      this.alertService.error('Invalid');
      return;
    }

    /**
     * Invoke the backend with a PUT request to update
     * the job with the form values.
     *
     * If create then navigate to the job id.
     */
    this.testpostEntityService.update(this.form.value).subscribe(
      (update) => {
        this.alertService.info('Saved Changes');

        if (navigate) this.router.navigate([`/home/testposts`]);
      },

      (err) => {
        this.alertService.error('Something went wrong');
      },

      () => {}
    );
  }

  patchForm(testpost: Testpost) {
    const {
      id,

      reference,
      name,
      date_installation,
      manufacture,
      model,
      serial_number,
      geometry,

      footer
    } = testpost;

    console.log('geometry', geometry)

    this.form.patchValue({
      id,

      reference,
      name,
      date_installation,
      manufacture,
      model,
      serial_number,
      geometry,

      footer: footer
      ? footer
      : {
          images: [],
          documents: [],
        },
    })

    this.latCtrl.setValue(geometry?.lat);
    this.lngCtrl.setValue(geometry?.lng);
  }

  clickMarker(): void {
    this.store.dispatch(
      MapActions.toggleSidebar({
        url: this.router.url,
      })
    );
  }


  onPreview(fileType: FileTypes): void {
    const { images, documents } = this.form.value.footer;

    switch (fileType) {
      case FileTypes.IMAGE:
        let _album: Array<IAlbum> = [];

        images.map((image: Image) => {
          const album = {
            src: `${this.API_URL}${image.url}`,
            caption: image.name,
            thumb: `${this.API_URL}${image.formats.thumbnail.url}`,
          };

          _album.push(album);
        });

        if (_album.length >= 1) this._lightbox.open(_album, 0);
        break;

      case FileTypes.DOCUMENT:
        const dialogRef = this.dialog.open(AttachmentModalComponent, {
          data: {
            fileType,
            documents,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {});
        break;
    }
  }

  onImageUpload(event): void {
    const { images } = this.form.value.footer;

    // this.images.push(event)

    // May be multiple so just preserving the previous object on the array of images

    this.form.patchValue({
      footer: {
        ...this.form.value.footer,
        images: [...images, event],
      },
    });

    this.submit(false);
  }

  onDocumentUpload(event): void {
    const { documents } = this.form.value.footer;

    this.form.patchValue({
      footer: {
        ...this.form.value.footer,
        documents: [...documents, event],
      },
    });

    this.submit(false);
  }


}
