import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JobEntityService } from '../../../entity-services/job-entity.service';
import { Job, Status } from '../../../models';
import { AlertService } from '../../../services';

// Store
import * as fromApp from '../../../store';

import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { JobType } from '../../../models/job-type.model';
import { JobTypeEntityService } from '../../../entity-services/job-type-entity.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private jobEntityService: JobEntityService,
    private jobTypeEntityervice: JobTypeEntityService,
    private statusEntityService: StatusEntityService,
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



    this.initialiseForm();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editAndViewMode(id);
    } else {
      this.createMode();
    }
  }

  editAndViewMode(id) {
    this.jobEntityService.getByKey(id).subscribe(
      (job) => {
        console.log('job', job);

        this.job = job;

        const { status, name, reference, job_type } = job;

        /**
         * Patch the form with values from the
         * existing job in the database
         */
        this.form.patchValue({
          status: status.id,
          name,
          reference,
          job_type: job_type.id
        })
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
}
