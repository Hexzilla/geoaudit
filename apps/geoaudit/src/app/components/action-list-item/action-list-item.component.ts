import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { SurveyEntityService } from '../../entity-services/survey-entity.service';
import { MarkerColours, Survey } from '../../models';

type Selectors =
  | 'tp_actions';

@Component({
  selector: 'geoaudit-action-list-item',
  templateUrl: './action-list-item.component.html',
  styleUrls: ['./action-list-item.component.scss']
})
export class ActionListItemComponent implements OnInit {

  @Input() item;
  
  @Input() selector: Selectors;

  survey: Survey;

  API_URL: string;


  constructor(
    private surveyEntityService: SurveyEntityService
  ) { }

  ngOnInit(): void {

    this.API_URL = environment.API_URL;

    if (this.item) {
      this.surveyEntityService.getByKey(this.item.survey.id).subscribe(survey => {
        this.survey = survey;
      })
    }
  }

  getConditionColour(action?: any) {
    let color = "00FFFFFF";

    if (action) {
        color = MarkerColours[action.condition.name];
    }

    return color;
  }
}
