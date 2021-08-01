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
import { Note, User } from '../../../models';
import { AlertService } from '../../../services';

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

  // Assignees
  users: Array<User> = [];
  allUsers: Array<User> = [];
  userControl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredUsers: Array<User> = [];
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  selectable = true;
  removable = true;

  private unsubscribe = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private noteEntityService: NoteEntityService,
    private formBuilder: FormBuilder,
    private userEntityService: UserEntityService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.initForm();

    this.getData();

    if (this.id) {
      this.getNoteAndPatchForm(this.id);
    } else {
      console.log('create');
    }
  }

  ngAfterViewInit() {
    // Users
    fromEvent(this.userInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter((res) => res.length >= 0),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        this.filteredUsers = this.filterUsers(text);
      });
  }

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
      images: [],
      attachmnts: [],

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

  getData() {
    this.userEntityService.getAll().subscribe(
      (users) => (this.allUsers = users),
      (err) => {}
    );
  }

  patchForm(note: Note) {
    const { id, datetime, description, assignees } = note;

    this.form.patchValue({
      id,
      datetime,
      description,
      assignees,
    });

    // Setup autosave after the form is patched
    this.autoSave();

    assignees.map((assignee) => {
      if (!this.users.find((item) => item.id === assignee.id)) {
        this.users.push(assignee);
      }
    });
  }

  // Users (Assignees)
  addUser(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    // Add our user
    if (value) {
      const filterAllUsersOnValue = this.filterUsers(value);

      if (filterAllUsersOnValue.length >= 1) {
        this.users.push(filterAllUsersOnValue[0]);
      }
    }

    // Clear the input value
    this.userInput.nativeElement.value = '';

    this.userControl.setValue(null);

    this.usersChange();
  }

  removeUser(user: User): void {
    const exists = this.users.find((item) => item.id === user.id);
    if (exists) {
      this.users = this.users.filter((item) => item.id !== exists.id);
    }

    this.usersChange();
  }

  selectedUser(event: MatAutocompleteSelectedEvent) {
    this.users.push(event.option.value);
    this.userInput.nativeElement.value = '';
    this.userControl.setValue(null);

    this.usersChange();
  }

  usersChange(): void {
    this.form.patchValue({
      assignees: this.users.map((user) => user.id),
      published: true,
    });
  }

  filterUsers(value: string): Array<User> {
    const filterValue = value.toLowerCase();

    return this.allUsers.filter((user) => {
      return (
        user.username.toLowerCase().indexOf(filterValue) === 0 ||
        user.email.toLowerCase().indexOf(filterValue) === 0 ||
        user.id.toString() === filterValue
      );
    });
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
}
