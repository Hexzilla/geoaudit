import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { JobEntityService } from '../../../../entity-services/job-entity.service';
import { Job, Status, User } from '../../../../models';
import { AlertService } from '../../../../services';

// Store
import * as fromApp from '../../../../store';

import { StatusEntityService } from '../../../../entity-services/status-entity.service';
import { JobType } from '../../../../models/job-type.model';
import { JobTypeEntityService } from '../../../../entity-services/job-type-entity.service';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserEntityService } from '../../../../entity-services/user-entity.service';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'geoaudit-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {

  /**
   * The primary colour to use on form elements.
   */
  color: ThemePalette = 'primary';

  /**
   * The form consisting of the form fields.
   */
  form: FormGroup;

  /**
   * The job object.
   */
  job: Job;

  /**
   * Array of job types i.e. CIPS, CAT5, etc.
   */
  jobTypes: Array<JobType>;

  /**
   * The current mode that we're in i.e.
   * are we creating a new job or are we viewing or editing 
   * an existing one.
   */
  mode: 'CREATE' | 'EDIT_VIEW'

  /**
   * An array of status i.e. NOT_STARTED, ONGOING, etc.
   */
  statuses: Array<Status>;

  /**
   * Whether the form has been submitted.
   */
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

  /**
   * The user input for the autocomplete.
   */
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;

  /**
   * The mat autocomplete for the user input assignees.
   */
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
    // Fetch statuses
    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.statuses = statuses;
      },

      (err) => {}
    )

    // Fetch job types
    this.jobTypeEntityervice.getAll().subscribe(
      (jobTypes) => {
        this.jobTypes = jobTypes;
      },

      (err) => {}
    )

    // Fetch users for assignees
    this.userEntityService.getAll().subscribe(
      (users) => {
        this.allUsers = users;
      },

      (err) => {}
    )

    /**
     * Initialise the form with properties and validation
     * constraints.
     */
    this.initialiseForm();

    /**
     * Capture the param id if any to determine
     * whether we should fetch a job or create a new one.
     */
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.mode = 'EDIT_VIEW';
      this.editAndViewMode(id);
    } else {
      this.mode = 'CREATE';
      this.createMode();
    }
  }

  ngAfterViewInit(): void {
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

  editAndViewMode(id) {
    /**
     * Get the job by the given id extracting the 
     * values and then patching the form.
     */
    this.jobEntityService.getByKey(id).subscribe(
      (job) => {
        this.job = job;

        const { status, name, reference, job_type, assignees, id } = job;

        /**
         * Patch the form with values from the
         * existing job in the database
         */
        this.form.patchValue({
          status: status.id,
          name,
          reference,
          job_type: job_type.id,
          assignees,

          id,
          published: true
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

      (err) => {}
    );
  }

  createMode() {
    /**
     * Create a new job using the default form values
     * and then extract the id ready for when we
     * update the form.
     */
    this.jobEntityService.add(this.form.value).subscribe(
      (job) => {
        this.job = job;

        this.form.patchValue({
          id: job.id
        })
      },

      (err) => {
        this.alertService.error('Something went wrong');
      }
    )
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      status: [null, Validators.required],
      name: [null, Validators.required],
      reference: [null, Validators.required],
      job_type: [null, Validators.required],
      assignees: [[], Validators.required],
      surveys: [[]],

      id: null,
      published: false
    });
  }

  submit() {
    this.form.patchValue({
      assignees: this.users.map((user) => user.id),
      published: true
    });

    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

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
    this.jobEntityService.update(this.form.value).subscribe(
      (update) => {
        this.router.navigate([`/home/jobs/job/${this.job.id}`]);
      },

      (err) => {
        this.alertService.error('Something went wrong');
      }
    )

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
