import { ENTER, COMMA } from '@angular/cdk/keycodes';
import {
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
} from '@angular/forms';
import {
  MatAutocomplete,
} from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Survey, User } from '../../models';

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
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      message: '',
    });
  }

  submit() {
    this.dialogRef.close({
      message: this.form.value.message
    });
  }
}
