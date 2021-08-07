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
import { Job, NOTIFICATION_DATA, Survey, User } from '../../models';
import { AlertService, AuthService } from '../../services';
import { NotificationService } from '../../services/notification.service';

export interface DialogData {
  surveys: Array<Survey>;
}

@Component({
  selector: 'geoaudit-refusal-modal',
  templateUrl: './refusal-modal.component.html',
  styleUrls: ['./refusal-modal.component.scss'],
})
export class RefusalModalComponent implements OnInit {
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
    public dialogRef: MatDialogRef<RefusalModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      message: '',
    });
  }

  submit() {
    this.data.surveys.map(survey => {
      const data: NOTIFICATION_DATA = {
        type: 'SURVEY_REFUSAL',
        subject: survey,
        message: this.form.value.message,
      };
      
      this.notificationService.post({
        source: this.authService.authValue.user,
        recipient: survey.conducted_by,
        data
      }).subscribe()
    });

    this.dialogRef.close();
  }
}
