import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import {
  map,
  filter,
  distinctUntilChanged,
  switchMap,
  debounceTime,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';
import { NoteEntityService } from '../../../entity-services/note-entity.service';
import { UserEntityService } from '../../../entity-services/user-entity.service';
import { Abriox, Note, User } from '../../../models';
import { AlertService, UploadService } from '../../../services';
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
    private uploadService: UploadService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.initForm();

    if (this.id) {
      this.getNoteAndPatchForm(this.id);
    } else {
      console.log('create');
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
    const { id, datetime, description, assignees, images, attachments, abrioxes } = note;

    this.form.patchValue({
      id,
      datetime,
      description,
      assignees,
      images,
      attachments,

      abrioxes
    });

    // Setup autosave after the form is patched
    this.autoSave();
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

    console.log('this', this.form.value);

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

  onUsersChange(users: Array<User>): void {
    this.form.patchValue({
      assignees: users.map((user) => user.id),
      published: true,
    });
  }

  onAbrioxesChange(abrioxes: Array<Abriox>): void {
    this.form.patchValue({
      abrioxes: abrioxes.map((abriox) => abriox.id),
      published: true,
    });
  }
}
