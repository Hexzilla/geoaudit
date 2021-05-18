import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import * as SurveyActions from '../../store/survey/survey.actions';
import * as SurveySelectors from '../../store/survey/survey.selectors';
import { Survey } from '../../models';
import * as fromApp from '../../store';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'geoaudit-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {

  surveys: Array<Survey>;

  surveys$: Observable<Array<Survey>>;

  constructor(
    private route: ActivatedRoute,
    private store: Store<fromApp.State>
  ) {}

  ngOnInit(): void {

    /**
     * Parse survey ids as supplied in the address bar
     * as query parameter.
     */
    this.parseSurveyIds();

    this.surveys$.subscribe(surveys => {
      console.log('obser', surveys)
    })
  }

  parseSurveyIds(): void {
    // Survey ids as query parameter.
    const surveyIds = this.route.snapshot.queryParamMap.get('surveys');

    // If the value is null, create a new array and store it
    // Else parse the JSON string we sent into an array
    if (surveyIds === null) {
      this.surveys = new Array<Survey>();
    } else {
      const parsedSurveys = JSON.parse(surveyIds);

      if (parsedSurveys) {
        this.store.dispatch(SurveyActions.fetchSurveysSelected({
          surveys: parsedSurveys
        }));

        /**
         * Select selected surveys from the surveys store
         * filtering on once we have fetched the correct 
         * number of surveys for the ones we selected.
         */
        this.store.select(SurveySelectors.Selected).pipe(
          filter(selected => selected.length === parsedSurveys.length),
        ).subscribe(selected => {
          this.surveys = selected;
        })

        this.surveys$ = this.store.select(SurveySelectors.Selected).pipe(
          filter(selected => selected.length === parsedSurveys.length),
        );
      }
    }
  }
}
