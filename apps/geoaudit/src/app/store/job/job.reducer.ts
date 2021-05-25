import { Action, createReducer, on } from "@ngrx/store";
import { Job, Result } from "../../models";

import * as JobActions from './job.actions';

export interface State {
    count: number,
    jobs: Array<Job>,
    selected: Array<Job>,

    result: Result
}

export const initialState: State = {
    count: 0,
    jobs: [],
    selected: [],
    result: Result.NONE
}

const surveyReducer = createReducer(
    initialState,
    on(JobActions.setCount, (state, action) => {
        return {
            ...state,
            count: action.count,
        }
    }),
    on(JobActions.fetchJobs, (state, action) => {
        return {
            ...state,
        }
    }),
    on(JobActions.setJobs, (state, action) => {
        return {
            ...state,
            jobs: action.jobs,
            result: Result.SUCCESS
        }
    }),
    on(JobActions.setJobsSelected, (state, action) => {
        return {
            ...state,
            selected: [...state.selected, action.job],
            result: Result.SUCCESS
        }
    }),
    on(JobActions.deleteJobSuccess, (state, action) => {
        return {
            ...state,
            jobs: state.jobs.filter(job => job.id !== action.job.id)
        }
    }),
    on(JobActions.clearResult, (state, action) => {
        return {
            ...state,
            result: Result.NONE
        }
    }),
)

export function reducer(state: State | undefined, action: Action) {
    return surveyReducer(state, action);
}