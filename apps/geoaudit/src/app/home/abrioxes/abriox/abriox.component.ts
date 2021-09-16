import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { Subject } from 'rxjs';
import {
  debounceTime,
  tap,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { AbrioxActionEntityService } from '../../../entity-services/abriox-action-entity.service';
import { AbrioxEntityService } from '../../../entity-services/abriox-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { TrEntityService } from '../../../entity-services/tr-entity.service';
import { AttachmentModalComponent } from '../../../modals/attachment-modal/attachment-modal.component';
import { Abriox, AbrioxAction, Image, MarkerColours, Survey } from '../../../models';
import { AlertService, AuthService, UploadService } from '../../../services';

@Component({
  selector: 'geoaudit-abriox',
  templateUrl: './abriox.component.html',
  styleUrls: ['./abriox.component.scss'],
})
export class AbrioxComponent implements OnInit {
  id: string;

  form: FormGroup;

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

  abriox_actions: Array<AbrioxAction> = [];

  abriox: Abriox;

  currentState = 0;
  approved = null;
  
  ready = false;

  surveys: Array<Survey> = [];

  constructor(
    private route: ActivatedRoute,
    private abrioxEntityService: AbrioxEntityService,
    private abrioxActionEntityService: AbrioxActionEntityService,
    private surveyEntityService: SurveyEntityService,
    private testpostEntityService: TestpostEntityService,
    private trEntityService: TrEntityService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private router: Router,
    private uploadService: UploadService,
    private authService: AuthService,
    private _lightbox: Lightbox,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.initForm();

    if (this.id) {
      this.getAbrioxAndPatchForm(this.id);
    } else {
      this.createMode();
    }
  }

  initForm() {
    this.form = this.formBuilder.group({
      name: null,

      testpost: null,
      tr: null,

      serial_number: null,
      telephone: null,
      date_installation: null,
      status: null,

      images: [],
      documents: [],

      id: null,
    });
  }

  getAbrioxAndPatchForm(id: string) {
    this.abrioxEntityService.getByKey(id).subscribe(
      (abriox) => {
        this.patchForm(abriox);

        this.currentState = abriox.status?.id;
        this.approved = abriox.approved;

        abriox.abriox_actions.map(abriox_action => {
          this.abrioxActionEntityService.getByKey(abriox_action.id).subscribe(item => {
            if (item.approved) {
              this.abriox_actions.push(item);
              this.abriox_actions.sort((a, b) => moment(a.date).diff(moment(b.date), 'seconds'))
            }

            this.surveyEntityService.getByKey(item.survey.id).subscribe(survey => {
              this.surveys.push(survey);
            })
          })
        })

        this.abriox = abriox;

        this.autoSave(this.id ? false : true);
      },

      (err) => {}
    );
  }

  createMode() {
    this.abrioxEntityService.add(this.form.value).subscribe(
      (abriox) => {
        this.patchForm(abriox);
      },

      (err) => {}
    );
  }

  patchForm(abriox: Abriox) {
    const {
      id,

      name,

      testpost,
      tr,

      serial_number,
      telephone,
      date_installation,
      status,

      images,
      documents
    } = abriox;

    this.form.patchValue({
      id,

      name,

      testpost: testpost?.id,
      tr: tr?.id,

      serial_number,
      telephone,
      date_installation,
      status: status?.id,

      images,
      documents
    });

    const testpostId = this.route.snapshot.queryParamMap.get('testpost');

    if (testpostId) {
      this.testpostEntityService.getByKey(testpostId).subscribe((item) => {
        this.form.patchValue({
          testpost: item,
        });
      });
    }

    const trId = this.route.snapshot.queryParamMap.get('tr');

    if (trId) {
      this.trEntityService.getByKey(trId).subscribe((item) => {
        this.form.patchValue({
          tr: item,
        });
      });
    }

    this.autoSave(this.id ? false : true);

    this.ready = true;
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
            .navigate([`/home/abrioxes/${this.form.value.id}`])
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
    this.abrioxEntityService.update(payload).subscribe(
      (update) => {
        this.alertService.info('ALERTS.saved_changes');

        if (navigate) this.router.navigate([`/home/abrioxes`]);
      },

      (err) => {
        this.alertService.error('ALERTS.something_went_wrong');
      },

      () => {}
    );
  }

  getLatestConditionColour() {
    if (this.abriox_actions && this.abriox_actions.length > 0) {      
      const tp_action = this.abriox_actions
        .filter(it => it && it.condition)
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
