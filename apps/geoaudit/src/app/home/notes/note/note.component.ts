import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import { FileTypes } from '../../../components/file-upload/file-upload.component';

@Component({
  selector: 'geoaudit-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent implements OnInit, AfterViewInit {
  id: string;

  form: FormGroup;

  disabled = false;

  color: ThemePalette = 'primary';

  private unsubscribe = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private noteEntityService: NoteEntityService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private router: Router,
    private uploadService: UploadService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

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
        this.patchForm(note);
      },

      (err) => {}
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

    // Setup autosave after the form is patched
    this.autoSave();
  }

  createMode() {
    this.form.patchValue({
      assignees: [this.authService.authValue.user],
    });

    this.noteEntityService.add(this.form.value).subscribe(
      (note) => {
        this.patchForm(note);

        this.autoSave();

        this.router.navigate([`/home/notes/${note.id}`], { replaceUrl: true });
      },

      (err) => {}
    );
  }

  autoSave() {
    this.form.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {
          this.submit(false);
        }),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe)
      )
      .subscribe();
  }

  submit(navigate = true) {
    // reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
      this.alertService.error('Invalid');
      return;
    }

    console.log('submit', this.form.value);

    /**
     * Invoke the backend with a PUT request to update
     * the job with the form values.
     *
     * If create then navigate to the job id.
     */
    this.noteEntityService.update(this.form.value).subscribe(
      (update) => {
        this.alertService.info('Saved Changes');

        // this.dataSource = new MatTableDataSource(update.surveys);

        if (navigate) this.router.navigate([`/home/notes`]);
      },

      (err) => {
        this.alertService.error('Something went wrong');
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
      [attribute]: items.map((item) => item.id),
    });
  }
}
