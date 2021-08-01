import { ENTER, COMMA } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  EventEmitter,
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { fromEvent } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { UserEntityService } from '../../entity-services/user-entity.service';
import { User } from '../../models';

@Component({
  selector: 'geoaudit-user-selector',
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.scss'],
})
export class UserSelectorComponent implements OnInit, AfterViewInit {
  @Input() assignees: Array<User> = [];

  selected: Array<User> = [];
  allUsers: Array<User> = [];
  userControl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredUsers: Array<User> = [];
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  selectable = true;
  removable = true;

  @Output() usersChange: EventEmitter<Array<User>> = new EventEmitter();

  constructor(private userEntityService: UserEntityService) {}

  ngOnInit(): void {
    this.userEntityService.getAll().subscribe(
      (users) => (this.allUsers = users),
      (err) => {}
    );

    this.assignees.map((assignee) => {
      if (!this.selected.find((item) => item.id === assignee.id)) {
        this.selected.push(assignee);
      }
    });
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
        this.filteredUsers = this.filter(text);
      });
  }

  // Users (Assignees)
  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    // Add our user
    if (value) {
      const filterAllUsersOnValue = this.filter(value);

      if (filterAllUsersOnValue.length >= 1) {
        this.selected.push(filterAllUsersOnValue[0]);
      }
    }

    // Clear the input value
    this.userInput.nativeElement.value = '';

    this.userControl.setValue(null);

    this.usersChange.emit(this.selected);
  }

  remove(user: User): void {
    const exists = this.selected.find((item) => item.id === user.id);
    if (exists) {
      this.selected = this.selected.filter((item) => item.id !== exists.id);
    }

    this.usersChange.emit(this.selected);
  }

  onSelected(event: MatAutocompleteSelectedEvent) {
    this.selected.push(event.option.value);
    this.userInput.nativeElement.value = '';
    this.userControl.setValue(null);

    this.usersChange.emit(this.selected);
  }

  filter(value: string): Array<User> {
    const filterValue = value.toLowerCase();

    return this.allUsers.filter((user) => {
      return (
        user.username.toLowerCase().indexOf(filterValue) === 0 ||
        user.email.toLowerCase().indexOf(filterValue) === 0 ||
        user.id.toString() === filterValue
      );
    });
  }
}
