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

    fetchSurveys$ = createEffect(() => this.actions$.pipe(
        ofType(SurveyActions.FETCH_SURVEYS),
        tap(console.log),
        mergeMap(() => this.surveyService.getSurveys()
            .pipe(
                map(surveys => ({ type: SurveyActions.SET_SURVEYS, surveys })),
                catchError(() => EMPTY)
            ))
    ));
}