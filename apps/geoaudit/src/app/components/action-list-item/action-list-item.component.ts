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

  constructor(
    private surveyEntityService: SurveyEntityService
  ) { }

  ngOnInit(): void {
    if (this.item && this.item.survey) {
      this.surveyEntityService.getByKey(this.item.survey.id).subscribe(survey => {
        this.survey = survey;
      })
    }
  }

  getAvatar() {
    const url = this.survey?.conducted_by?.avatar.url
    if (url) {
      return `${environment.API_URL} + ${url}`;
    }
    return "https://bestoked.ams3.digitaloceanspaces.com/geoaudit/static/assets/Avatar%20-%20Geoaudit.png"
  }

  getConditionColour(action?: any) {
    return action ? MarkerColours[action.condition.name] : "00FFFFFF";
  }
}
