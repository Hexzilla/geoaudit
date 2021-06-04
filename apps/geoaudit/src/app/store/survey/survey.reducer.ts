import { Action, createReducer, on } from "@ngrx/store";
import { Result, Survey } from "../../models";

import * as SurveyActions from './survey.actions';

export interface State {
    count: number,
    surveys: Array<Survey>,
    selected: Array<Survey>,

    result: Result
}

export const initialState: State = {
    count: 0,
    surveys: [],
    selected: [],
    result: Result.NONE
}

const surveyReducer = createReducer(
    initialState,
    on(SurveyActions.setCount, (state, action) => {
        return {
            ...state,
            count: action.count,
        }
    }),
    on(SurveyActions.fetchSurveys, (state, action) => {
        return {
            ...state,
        }
    }),
    on(SurveyActions.setSurveys, (state, action) => {
        console.log('SET_SURVEYS', action.surveys)
        return {
            ...state,
            surveys: action.surveys,
            result: Result.SUCCESS
        }
    }),
    on(SurveyActions.setSurveysSelected, (state, action) => {
        return {
            ...state,
            selected: [...state.selected, action.survey],
            result: Result.SUCCESS
        }
    }),
    on(SurveyActions.deleteSurveySuccess, (state, action) => {
        return {
            ...state,
            surveys: state.surveys.filter(survey => survey.id !== action.survey.id)
        }
    }),
    on(SurveyActions.clearResult, (state, action) => {
        return {
            ...state,
            result: Result.NONE
        }
    }),
)

export function reducer(state: State | undefined, action: Action) {
    return surveyReducer(state, action);
}