import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { catchError, map, mergeMap, tap } from "rxjs/operators";

import * as SurveyActions from './survey.actions';
import { SurveyService } from "../../services";

@Injectable()
export class SurveyEffects {

    constructor(
        private actions$: Actions,
        private surveyService: SurveyService
    ) {}

    countSurveys$ = createEffect(() => this.actions$.pipe(
        ofType(SurveyActions.COUNT_SURVEYS),
        mergeMap((payload) => this.surveyService.count(payload)
            .pipe(
                map(count => ({ type: SurveyActions.SET_COUNT, count}))
            ))
    ))

    fetchSurveys$ = createEffect(() => this.actions$.pipe(
        ofType(SurveyActions.FETCH_SURVEYS),
        tap(console.log),
        mergeMap((payload) => this.surveyService.getSurveys(payload)
            .pipe(
                map(surveys => ({ type: SurveyActions.SET_SURVEYS, surveys })),
                catchError(() => EMPTY)
            ))
    ));

    deleteSurvey$ = createEffect(() => this.actions$.pipe(
        ofType(SurveyActions.DELETE_SURVEY),
        mergeMap(({ survey }) => this.surveyService.delete(survey)
            .pipe(
                map(data => ({ type: SurveyActions.DELETE_SURVEY_SUCCESS, data}))
            ))
    ))
}