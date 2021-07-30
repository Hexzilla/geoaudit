import { createAction, props } from '@ngrx/store';
import { Job, Parameters } from '../../models';

export const COUNT_JOBS = '[To Do List - Jobs] Count';
export const SET_COUNT = '[To Do List - Jobs] Set count';
export const FETCH_JOBS = '[To Do List - Jobs] Fetch jobs';

export const FETCH_JOBS_SELECTED = '[To Do List - Jobs] Fetch jobs selected';
export const FETCH_JOBS_SELECTED_FAILED = '[To Do List - Jobs] Fetch jobs selected failed';

export const SET_JOBS = '[To Do List - Jobs] Set jobs';
export const SET_JOBS_SELECTED = '[To Do List - Jobs] Set jobs selected';

export const DELETE_JOB = '[To Do List - Jobs] Delete job';
export const DELETE_JOBS = '[To Do List - Jobs] Delete jobs';
export const DELETE_JOB_SUCCESS = '[To Do List - Jobs] Delete job success';
export const DELETE_JOB_FAILED = '[To Do List - Jobs] Delete job failed';

export const CLEAR_RESULT = '[To Do List - Jobs] Clear result';

export const countJobs = createAction(
    COUNT_JOBS
);

export const setCount = createAction(
    SET_COUNT,
    props<{
        count: any
    }>()
);

export const fetchJobs = createAction(
    FETCH_JOBS,
    props<Parameters>()
);

export const fetchJobsSelected = createAction(
    FETCH_JOBS_SELECTED,
    props<{
        jobs: Array<number>
    }>()
);

export const fetchJobsSelectedFailed = createAction(
    FETCH_JOBS_SELECTED_FAILED,
    props<{
        job: number,
        err: any
    }>()
);

export const setJobs = createAction(
    SET_JOBS,
    props<{
        jobs: Array<Job>
    }>()
);

export const setJobsSelected = createAction(
    SET_JOBS_SELECTED,
    props<{
        job: Job
    }>()
);

export const deleteJob = createAction(
    DELETE_JOB,
    props<{
        job: Job
    }>()
);

export const deleteJobs = createAction(
    DELETE_JOBS,
    props<{
        jobs: Array<Job>
    }>()
);

export const deleteJobFailed = createAction(
    DELETE_JOB_FAILED,
    props<{
        job: Job,
        err: any
    }>()
);

export const deleteJobSuccess = createAction(
    DELETE_JOB_SUCCESS,
    props<{
        job: Job
    }>()
);

export const clearResult = createAction(
    CLEAR_RESULT
);