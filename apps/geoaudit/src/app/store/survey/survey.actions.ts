import { createAction, props } from '@ngrx/store';
import { Survey } from '../../models';

export const FETCH_SURVEYS = '[To Do List - Surveys] Fetch';
export const SET_SURVEYS = '[To Do List - Surveys] Set';

export const fetchSurveys = createAction(
    '[To Do List - Surveys] Fetch'
);

export const setSurveys = createAction(
    '[To Do List - Surveys] Set',
    props<{
        surveys: Array<Survey>
    }>()
);