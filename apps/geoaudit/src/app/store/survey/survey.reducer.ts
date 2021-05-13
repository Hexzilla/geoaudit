import { Action, createReducer, on } from "@ngrx/store";
import { Survey } from "../../models";

import * as SurveyActions from './survey.actions';

export interface State {
    count: number,
    surveys: Array<Survey>
}

export const initialState: State = {
    count: 0,
    surveys: []
}

const surveyReducer = createReducer(
    initialState,
    on(SurveyActions.setCount, (state, action) => {
        return {
            ...state,
            count: action.count
        }
    }),
    on(SurveyActions.fetchSurveys, (state, action) => {
        return {
            ...state,
        }
    }),
    on(SurveyActions.setSurveys, (state, action) => {
        return {
            ...state,
            surveys: action.surveys
        }
    }),
    on(SurveyActions.deleteSurveySuccess, (state, action) => {
        console.log('deleteSurveySuccess', action)
        return {
            ...state,
        }
    }),
)

export function reducer(state: State | undefined, action: Action) {
    return surveyReducer(state, action);
}