import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromApp from '../../store';
import { statuses } from '../../models'
import { AlertService } from '../../services';

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'geoaudit-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {

  color: ThemePalette = 'primary';

  newJob = false;

  form: FormGroup;

  selectedStatus: string;

  statuses: Array<String>;

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.statuses = Object.keys(statuses);

    /**
     * Initialise the form with properties and
     * validation constraints.
     */
     this.initialiseForm();
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
   initialiseForm(): void {
    this.form = this.formBuilder.group({
      status: [statuses.NOT_STARTED, Validators.required],
      name: [null, Validators.required],
      // assigned_to: 

      title: ['Event Title', Validators.required],
      allDay: [false, Validators.required],
      date_assigned: [moment().toISOString(), Validators.required],
      date_delivery: [moment().toISOString(), Validators.required],
      notes: [''],
      surveys: [[], Validators.required],

      id: null,
      reference: '',
      published: false
    });
  }

  submit(): void {

  }

  /**
   * On selection change of the steps i.e.
   * click on step 1 -> catch event -> do something.
   * @param event 
   */
  selectionChange(event: StepperSelectionEvent) {
    console.log('selectionChange', event.selectedIndex)
    switch (event.selectedIndex) {
      case 0:

      break;

      case 1:

      break;

      case 2:

      break;

      case 3:

      break;

      case 4:

      break;

      case 5:

      break;
    }
  }
  
  isStep1Completed(): boolean {
    return false;
  }
  
  isStep2Completed(): boolean {
    return false;
  }

  isStep3Completed(): boolean {
    return false;
  }

  isStep4Completed(): boolean {
    return false;
  }

  isStep5Completed(): boolean {
    return false;
  }

  isStep6Completed(): boolean {
    return false;
  }
}
