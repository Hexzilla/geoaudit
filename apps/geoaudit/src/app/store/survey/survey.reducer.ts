import { Action, createReducer, on } from "@ngrx/store";
import { Survey } from "../../models";

import * as SurveyActions from './survey.actions';

export interface State {
    surveys: Array<Survey>
}

export const initialState: State = {
    surveys: []
}

const surveyReducer = createReducer(
    initialState,
    on(SurveyActions.fetchSurveys, (state, action) => {
        return {
            ...state,
            surveys: []
        }
    }),
    on(SurveyActions.setSurveys, (state, action) => {
        return {
            ...state,
            surveys: action.surveys
        }
    })
)

export function reducer(state: State | undefined, action: Action) {
    return surveyReducer(state, action);
}