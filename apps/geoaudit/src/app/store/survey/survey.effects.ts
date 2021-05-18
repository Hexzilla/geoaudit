import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, merge, of } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap, tap } from "rxjs/operators";

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

    fetchSurveysSelected$ = createEffect(() => this.actions$.pipe(
        ofType(SurveyActions.fetchSurveysSelected),
        exhaustMap(({ surveys }) => 
            merge(
                ...surveys.map(survey =>
                    this.surveyService.getSurvey(survey).pipe(
                        map((data) => ({ type: SurveyActions.SET_SURVEYS_SELECTED, survey: data })),
                        catchError(err =>
                            of(SurveyActions.fetchSurveysSelectedFailed({ survey, err: err.message })))
                    )
                )
            )
        )
    ));

    deleteSurvey$ = createEffect(() => this.actions$.pipe(
        ofType(SurveyActions.DELETE_SURVEY),
        mergeMap(({ survey }) => this.surveyService.delete(survey)
            .pipe(
                map(() => ({ type: SurveyActions.DELETE_SURVEY_SUCCESS, survey}))
            ))
    ));

    /**
     * Delete surveys effect triggered on type deleteSurveys.
     * This effect expects an array of surveys. We spread the array
     * and then map through each survey calling the delete endpoint
     * for a given survey of which if successful we remove the survey
     * from the surveys array or we raise an error.
     */
    deleteSurveys$ = createEffect(() => this.actions$.pipe(
        ofType(SurveyActions.deleteSurveys),
        exhaustMap(({ surveys }) => 
            merge(
                ...surveys.map(survey =>
                    this.surveyService.delete(survey).pipe(
                        map(() => ({ type: SurveyActions.DELETE_SURVEY_SUCCESS, survey })),
                        catchError(err =>
                            of(SurveyActions.deleteSurveyFailed({ survey, err: err.message })))
                    )
                )
            )
        )
    ));
}