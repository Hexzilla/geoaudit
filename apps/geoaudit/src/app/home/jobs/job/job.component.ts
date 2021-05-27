import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { JobEntityService } from '../../../entity-services/job-entity.service';
import { Job, Status, User } from '../../../models';
import { AlertService } from '../../../services';

// Store
import * as fromApp from '../../../store';

import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { JobType } from '../../../models/job-type.model';
import { JobTypeEntityService } from '../../../entity-services/job-type-entity.service';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserEntityService } from '../../../entity-services/user-entity.service';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'geoaudit-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent implements OnInit {
  color: ThemePalette = 'primary';

  form: FormGroup;

  job: Job;

  jobTypes: Array<JobType>;

  statuses: Array<Status>;

  submitted = false;

  // Chip and Autocomplete
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  userControl = new FormControl();
  filteredUsers: Array<User>;
  users: Array<User> = [];
  allUsers: Array<User> = [];

  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private formBuilder: FormBuilder,
    private jobEntityService: JobEntityService,
    private jobTypeEntityervice: JobTypeEntityService,
    private statusEntityService: StatusEntityService,
    private userEntityService: UserEntityService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // this.statuses = Object.keys(statuses);

    // Fetch statuses
    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.statuses = statuses;
      },

      (err) => {
        console.log('err');
      }
    )

    // Fetch job types
    this.jobTypeEntityervice.getAll().subscribe(
      (jobTypes) => {
        this.jobTypes = jobTypes;
      },

      (err) => {
        console.log('err')
      }
    )

    // Fetch users for assignees
    this.userEntityService.getAll().subscribe(
      (users) => {
        this.allUsers = users;
      },

      (err) => {
        console.log('err')
      }
    )


    this.initialiseForm();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editAndViewMode(id);
    } else {
      this.createMode();
    }
  }

  ngAfterViewInit(): void {
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

  editAndViewMode(id) {
    this.jobEntityService.getByKey(id).subscribe(
      (job) => {
        console.log('job', job);

        this.job = job;

        const { status, name, reference, job_type, assignees } = job;

        /**
         * Patch the form with values from the
         * existing job in the database
         */
        this.form.patchValue({
          status: status.id,
          name,
          reference,
          job_type: job_type.id,
          users: assignees
        })

          /**
           * Do not push already existing surveys onto the array.
           */
           assignees.map((assignee) => {
            if (!this.users.find((item) => item.id === assignee.id)) {
              this.users.push(assignee);
            }
          });
      },

      (err) => {
        console.log('err');
      }
    );
  }

  createMode() {}

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      status: [null, Validators.required],
      name: [null, Validators.required],
      reference: [null, Validators.required],
      job_type: [null, Validators.required],
      users: [[], Validators.required],
      // assigned_to:

      // title: ['Event Title', Validators.required],
      // allDay: [false, Validators.required],
      // date_assigned: [moment().toISOString(), Validators.required],
      // date_delivery: [moment().toISOString(), Validators.required],
      // notes: [''],
      // surveys: [[], Validators.required],

      id: null,
      published: false
    });
  }

  submit() {
    
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
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
  }

  remove(user: User): void {
    const exists = this.users.find((item) => item.id === user.id);
    if (exists) {
      this.users = this.users.filter((item) => item.id !== exists.id);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.users.push(event.option.value);
    this.userInput.nativeElement.value = '';
    this.userControl.setValue(null);
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
}
