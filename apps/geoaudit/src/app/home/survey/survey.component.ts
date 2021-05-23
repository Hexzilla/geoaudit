import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';

import { statuses } from '../../models'

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

  selectedValue: string;

  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  statuses: Array<String>;

  constructor() { }

  ngOnInit(): void {
    this.statuses = Object.keys(statuses);
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
