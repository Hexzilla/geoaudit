import { createAction, props } from '@ngrx/store';
import { Parameters, Survey } from '../../models';

export const COUNT_SURVEYS = '[To Do List - Surveys] Count';
export const SET_COUNT = '[To Do List - Surveys] Set count';
export const FETCH_SURVEYS = '[To Do List - Surveys] Fetch surveys';

export const FETCH_SURVEYS_SELECTED = '[To Do List - Surveys] Fetch surveys selected';
export const FETCH_SURVEYS_SELECTED_FAILED = '[To Do List - Surveys] Fetch surveys selected failed';

export const SET_SURVEYS = '[To Do List - Surveys] Set surveys';
export const SET_SURVEYS_SELECTED = '[To Do List - Surveys] Set surveys selected';

export const DELETE_SURVEY = '[To Do List - Surveys] Delete survey';
export const DELETE_SURVEYS = '[To Do List - Surveys] Delete surveys';
export const DELETE_SURVEY_SUCCESS = '[To Do List - Surveys] Delete survey success';
export const DELETE_SURVEY_FAILED = '[To Do List - Surveys] Delete survey failed';

export const CLEAR_RESULT = '[To Do List - Surveys] Clear result';

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

export const fetchSurveysSelected = createAction(
    FETCH_SURVEYS_SELECTED,
    props<{
        surveys: Array<number>
    }>()
);

export const fetchSurveysSelectedFailed = createAction(
    FETCH_SURVEYS_SELECTED_FAILED,
    props<{
        survey: number,
        err: any
    }>()
);

export const setSurveys = createAction(
    SET_SURVEYS,
    props<{
        surveys: Array<Survey>
    }>()
);

export const setSurveysSelected = createAction(
    SET_SURVEYS_SELECTED,
    props<{
        survey: Survey
    }>()
);

export const deleteSurvey = createAction(
    DELETE_SURVEY,
    props<{
        survey: Survey
    }>()
);

export const deleteSurveys = createAction(
    DELETE_SURVEYS,
    props<{
        surveys: Array<Survey>
    }>()
);

export const deleteSurveyFailed = createAction(
    DELETE_SURVEY_FAILED,
    props<{
        survey: Survey,
        err: any
    }>()
);

export const deleteSurveySuccess = createAction(
    DELETE_SURVEY_SUCCESS,
    props<{
        survey: Survey
    }>()
);

export const clearResult = createAction(
    CLEAR_RESULT
);