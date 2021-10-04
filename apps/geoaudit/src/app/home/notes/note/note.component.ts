import { AfterViewInit, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import {
  distinctUntilChanged,
  debounceTime,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NoteEntityService } from '../../../entity-services/note-entity.service';
import { Note } from '../../../models';
import { AlertService, AuthService, UploadService } from '../../../services';
import { MatDialog } from '@angular/material/dialog';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { JobEntityService } from '../../../entity-services/job-entity.service';
import { AbrioxEntityService } from '../../../entity-services/abriox-entity.service';
import { ResistivityEntityService } from '../../../entity-services/resistivity-entity.service';
import { SiteEntityService } from '../../../entity-services/site-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { TrEntityService } from '../../../entity-services/tr-entity.service';
import { DeleteModalComponent } from '../../../modals/delete-modal/delete-modal.component';

@Component({
  selector: 'geoaudit-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent implements OnInit, AfterViewInit {
  @Input() id: string;

  note: Note;

  form: FormGroup;

  disabled = false;

  color: ThemePalette = 'primary';

  private unsubscribe = new Subject<void>();

  @Output() closeNote = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private abrioxEntityService: AbrioxEntityService,
    private jobEntityService: JobEntityService,
    private resistivityEntityService: ResistivityEntityService,
    private siteEntityService: SiteEntityService,
    private surveyEntityService: SurveyEntityService,
    private testpostEntityService: TestpostEntityService,
    private trEntityService: TrEntityService,
    private noteEntityService: NoteEntityService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private router: Router,
    private uploadService: UploadService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.paramMap.get('notes')) {
      this.id = this.route.snapshot.paramMap.get('id');
    }
    this.initForm();

    if (this.id) {
      this.getNoteAndPatchForm(this.id);
    } else {
      this.createMode();
    }
  }

  ngAfterViewInit() {}

  getNoteAndPatchForm(id: string) {
    this.noteEntityService.getByKey(id).subscribe(
      (note) => {
        this.note = note;
        this.patchForm(note);
      },

      (err) => {
      }
    );
  }

  initForm() {
    this.form = this.formBuilder.group({
      datetime: moment().toISOString(),
      description: null,
      images: [[]],
      attachments: [[]],

      assignees: [],

      abrioxes: [],
      jobs: [],
      resistivities: [],
      sites: [],
      surveys: [],
      testposts: [],
      trs: [],

      id: null, // Whilst we don't edit the id, we submit the form.
    });
  }

  patchForm(note: Note) {
    const {
      id,
      datetime,
      description,
      assignees,
      images,
      attachments,
      abrioxes,
      jobs,
      resistivities,
      sites,
      surveys,
      testposts,
      trs,
    } = note;

    this.form.patchValue({
      id,
      datetime,
      description,
      assignees,
      images,
      attachments,

      abrioxes,
      jobs,
      resistivities,
      sites,
      surveys,
      testposts,
      trs,
    });

    /**
     * Handle additional query parameters such that when we're creating a note
     * for a given job that we have a jobs query parameter with an array of
     * job ids although this may just be one job. There may be other items too.
     */
    const abrioxIds = this.route.snapshot.queryParamMap.get('abrioxes');

    if (abrioxIds) {
      JSON.parse(abrioxIds).map((abrioxId) => {
        this.abrioxEntityService.getByKey(abrioxId).subscribe((abriox) => {
          this.form.patchValue({
            abrioxes: [...this.form.value.abrioxes, abriox],
          });
        });
      });
    }

    const jobIds = this.route.snapshot.queryParamMap.get('jobs');

    if (jobIds) {
      JSON.parse(jobIds).map((jobId) => {
        this.jobEntityService.getByKey(jobId).subscribe((job) => {
          this.form.patchValue({
            jobs: [...this.form.value.jobs, job],
          });
        });
      });
    }

    const resistivityIds = this.route.snapshot.queryParamMap.get(
      'resistivities'
    );

    if (resistivityIds) {
      JSON.parse(resistivityIds).map((resistivityId) => {
        this.resistivityEntityService
          .getByKey(resistivityId)
          .subscribe((resistivity) => {
            this.form.patchValue({
              resistivities: [...this.form.value.resistivities, resistivity],
            });
          });
      });
    }

    const siteIds = this.route.snapshot.queryParamMap.get('sites');

    if (siteIds) {
      JSON.parse(siteIds).map((siteId) => {
        this.siteEntityService.getByKey(siteId).subscribe((site) => {
          this.form.patchValue({
            sites: [...this.form.value.sites, site],
          });
        });
      });
    }

    const surveyIds = this.route.snapshot.queryParamMap.get('surveys');

    if (surveyIds) {
      JSON.parse(surveyIds).map((surveyId) => {
        this.surveyEntityService.getByKey(surveyId).subscribe((survey) => {
          this.form.patchValue({
            surveys: [...this.form.value.surveys, survey],
          });
        });
      });
    }

    const testpostIds = this.route.snapshot.queryParamMap.get('testposts');

    if (testpostIds) {
      JSON.parse(testpostIds).map((testpostId) => {
        this.testpostEntityService
          .getByKey(testpostId)
          .subscribe((testpost) => {
            this.form.patchValue({
              testposts: [...this.form.value.testposts, testpost],
            });
          });
      });
    }

    const trIds = this.route.snapshot.queryParamMap.get('trs');

    if (trIds) {
      JSON.parse(trIds).map((trId) => {
        this.trEntityService.getByKey(trId).subscribe((tr) => {
          this.form.patchValue({
            trs: [...this.form.value.trs, tr],
          });
        });
      });
    }

    this.autoSave();
  }

  createMode() {
    this.form.patchValue({
      assignees: [this.authService.authValue.user],
    });

    this.noteEntityService.add(this.form.value).subscribe(
      (note) => {
        this.id = note.id.toString();
        this.note = note;
        this.patchForm(note);

        this.autoSave(false);

        // this.router.navigate([`/home/notes/${this.form.value.id}`], {
        //   replaceUrl: true,
        // });
      },

      (err) => {}
    );
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
        // if (reload) {
        //   this.router
        //     .navigate([`/home/notes/${this.form.value.id}`])
        //     .then(() => {
        //       window.location.reload();
        //     });
        // }
      });
  }

  submit(navigate = true) {
    // reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
      this.alertService.error('ALERTS.invalid');
      return;
    }

    /**
     * Invoke the backend with a PUT request to update
     * the job with the form values.
     *
     * If create then navigate to the job id.
     */
    this.noteEntityService.update(this.form.value).subscribe(
      (update) => {
        this.alertService.info('ALERTS.saved_changes');

        // if (navigate) this.router.navigate([`/home/notes`]);
      },

      (err) => {
        this.alertService.error('ALERTS.something_went_wrong');
      },

      () => {}
    );
  }

  onPreview(fileType: FileTypes) {
    const { images, attachments } = this.form.value;
    this.uploadService.onPreview(fileType, images, attachments);
  }

  onImageUpload(event): void {
    this.form.patchValue({
      images: [...this.form.value.images, event],
    });

    this.submit(false);
  }

  onDocumentUpload(event): void {
    this.form.patchValue({
      attachments: [...this.form.value.attachments, event],
    });

    this.submit(false);
  }

  onItemsChange(items: Array<any>, attribute: string): void {
    this.form.patchValue({
      [attribute]: items.length > 0 ? items.map((item) => item.id) : [],
    });
  }

  saveNote() {
    this.closeNote.emit();
  }

  deleteNote() {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      data: {
        length: 1,
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.noteEntityService.delete(this.id).subscribe(() => {
          this.closeNote.emit();
        })
      }
    });
  }
}
