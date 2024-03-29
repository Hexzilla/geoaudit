import { ENTER, COMMA } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fromEvent } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { JobEntityService } from '../../entity-services/job-entity.service';
import { NotificationEntityService } from '../../entity-services/notification-entity.service';
import { UserEntityService } from '../../entity-services/user-entity.service';
import { Job, NOTIFICATION_DATA, User } from '../../models';
import { AlertService, AuthService } from '../../services';
import { NotificationService } from '../../services/notification.service';

export interface DialogData {
  job: Job;
}

@Component({
  selector: 'geoaudit-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss'],
})
export class ShareModalComponent implements OnInit, AfterViewInit {
  form: FormGroup;

  // Chip and Autocomplete
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  userControl = new FormControl();
  filteredUsers: Array<User>;
  users: Array<User> = [];
  allUsers: Array<User> = [];

  /**
   * The user input for the autocomplete.
   */
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;

  /**
   * The mat autocomplete for the user input assignees.
   */
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    public dialogRef: MatDialogRef<ShareModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private userEntityService: UserEntityService,
    private formBuilder: FormBuilder,
    private jobEntityService: JobEntityService,
    private alertService: AlertService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userEntityService.getAll().subscribe(
      (users) => {
        this.allUsers = users.filter(user => user.id !== this.authService.authValue.user.id);
      },

      (err) => {}
    );

    this.form = this.formBuilder.group({
      assignees: [[], Validators.required],
      message: '',
    });
  }

  ngAfterViewInit(): void {
    // this.dataSource.paginator = this.paginator;

    /**
     * Used for filtering users (assignees) on a given
     * input text filter.
     */
    fromEvent(this.userInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter((res) => res.length >= 0),
        // debounceTime(1000), // if needed for delay
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        this.filteredUsers = this._filter(text);
      });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our user
    if (value) {
      const filterAllUsersOnValue = this._filter(value);

      if (filterAllUsersOnValue.length >= 1) {
        this.users.push(filterAllUsersOnValue[0]);
      }
    }

    // Clear the input value
    this.userInput.nativeElement.value = '';

    this.userControl.setValue(null);

    this.assigneesChange();
  }

  remove(user: User): void {
    const exists = this.users.find((item) => item.id === user.id);
    if (exists) {
      this.users = this.users.filter((item) => item.id !== exists.id);
    }

    this.assigneesChange();
  }

  assigneesChange(): void {
    this.form.patchValue({
      assignees: this.users.map((user) => user.id),
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.users.push(event.option.value);
    this.userInput.nativeElement.value = '';
    this.userControl.setValue(null);

    this.assigneesChange();
  }

  private _filter(value: string): Array<User> {
    const filterValue = value.toLowerCase();

    return this.allUsers.filter((user) => {
      return (
        user.username.toLowerCase().indexOf(filterValue) === 0 ||
        user.email.toLowerCase().indexOf(filterValue) === 0 ||
        user.id.toString() === filterValue
      );
    });
  }

  submit() {
    /**
     * Update assignees of the job such that the users
     * selected here are added to the job.
     *
     * We should preserve assignees who are already part of the job.
     */

    const assignees: Array<User> = [
      ...this.data.job.assignees.map((assignee) => assignee.id),
      ...this.form.value.assignees,
    ];

    this.jobEntityService
      .update({
        ...this.data.job,
        assignees,
      })
      .subscribe(
        (update) => {
          this.alertService.info('ALERTS.saved_changes');
        },

        (err) => {
          this.alertService.error('ALERTS.something_went_wrong');
        }
      );

    const data: NOTIFICATION_DATA = {
      type: 'SHARE_JOB',
      subject: this.data.job,
      message: this.form.value.message,
    };

    this.form.value.assignees.map((assignee) => {
      this.notificationService
        .post({
          source: this.authService.authValue.user,
          recipient: assignee,
          data,
        })
        .subscribe(
          (res) => {
            this.dialogRef.close();
          },

          (err) => {}
        );
    });
  }
}
