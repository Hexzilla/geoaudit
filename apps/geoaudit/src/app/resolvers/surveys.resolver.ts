import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import { Survey } from '../models';
import { SurveyService } from '../services';

@Injectable()
export class SurveysResolver implements Resolve<Array<Survey>> {

  constructor(private surveyService: SurveyService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Array<Survey>> {
    return this.surveyService.getSurveys({ start: 0, limit: 100 });
  }
}

