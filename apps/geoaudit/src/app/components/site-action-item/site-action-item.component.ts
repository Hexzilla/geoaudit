import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { SurveyEntityService } from '../../entity-services/survey-entity.service';
import { Survey, SiteAction } from '../../models';

type Selectors =
  | 'tp_actions';

@Component({
  selector: 'geoaudit-site-action-item',
  templateUrl: './site-action-item.component.html',
  styleUrls: ['./site-action-item.component.scss']
})
export class SiteActionItemComponent implements OnInit {

  @Input() item: SiteAction;
  
  @Input() selector: Selectors;

  @Output() onNavigate?: EventEmitter<number> = new EventEmitter();

  survey: Survey;

  constructor(
    private surveyEntityService: SurveyEntityService
  ) { }

  ngOnInit(): void {
    if (this.item && this.item.survey) {
      this.surveyEntityService.getByKey(this.item.survey).subscribe(survey => {
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

  getStatusColour(action?: SiteAction) {
    if (action.site_status == 1) {
      return '008AC926'
    } else if (action.site_status == 2) {
      return '00E71D36'
    } else if (action.site_status == 3) {
      return '00FFBE0B'
    } else if (action.site_status == 4) {
      return '00000000'
    } else if (action.site_status == 5) {
      return '00FFBE0B'
    }
    return "00FFFFFF";
  }

  navigate() {
    this.onNavigate?.emit(this.item.id)
  }
}
