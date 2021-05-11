import { createAction, props } from '@ngrx/store';
import { Parameters, Survey } from '../../models';

export const COUNT_SURVEYS = '[To Do List - Surveys] Count';
export const SET_COUNT = '[To Do List - Surveys] Set count';
export const FETCH_SURVEYS = '[To Do List - Surveys] Fetch surveys';
export const SET_SURVEYS = '[To Do List - Surveys] Set surveys';

export const countSurveys = createAction(
    COUNT_SURVEYS,
    props<Parameters>()
);

export const setCount = createAction(
    SET_COUNT,
    props<{
        count: any
    }>()
);

export const fetchSurveys = createAction(
    FETCH_SURVEYS,
    props<Parameters>()
);

export const setSurveys = createAction(
    SET_SURVEYS,
    props<{
        surveys: Array<Survey>
    }>()
);