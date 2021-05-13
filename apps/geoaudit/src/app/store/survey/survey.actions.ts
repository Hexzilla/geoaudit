import { createAction, props } from '@ngrx/store';
import { Parameters, Survey } from '../../models';

export const COUNT_SURVEYS = '[To Do List - Surveys] Count';
export const SET_COUNT = '[To Do List - Surveys] Set count';
export const FETCH_SURVEYS = '[To Do List - Surveys] Fetch surveys';
export const SET_SURVEYS = '[To Do List - Surveys] Set surveys';

export const DELETE_SURVEY = '[To Do List - Surveys] Delete survey';
export const DELETE_SURVEY_SUCCESS = '[To Do List - Surveys] Delete survey success';

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

export const deleteSurvey = createAction(
    DELETE_SURVEY,
    props<{
        survey: Survey
    }>()
);

export const deleteSurveySuccess = createAction(
    DELETE_SURVEY_SUCCESS,
    props<{
        survey: Survey
    }>()
);