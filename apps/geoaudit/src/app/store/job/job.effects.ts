import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, merge, of } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap, tap } from "rxjs/operators";

import * as JobActions from './job.actions';
import { JobService } from "../../services";

@Injectable()
export class JobEffects {

    constructor(
        private actions$: Actions,
        private jobService: JobService
    ) {}

    countJobs$ = createEffect(() => this.actions$.pipe(
        ofType(JobActions.COUNT_JOBS),
        mergeMap(() => this.jobService.count()
            .pipe(
                map(count => ({ type: JobActions.SET_COUNT, count}))
            ))
    ))

    fetchJobs$ = createEffect(() => this.actions$.pipe(
        ofType(JobActions.FETCH_JOBS),
        tap(console.log),
        mergeMap((payload) => this.jobService.getJobs(payload)
            .pipe(
                map(jobs => ({ type: JobActions.SET_JOBS, jobs })),
                catchError(() => EMPTY)
            ))
    ));

    fetchJobsSelected$ = createEffect(() => this.actions$.pipe(
        ofType(JobActions.fetchJobsSelected),
        exhaustMap(({ jobs }) => 
            merge(
                ...jobs.map(job =>
                    this.jobService.getJob(job).pipe(
                        map((data) => ({ type: JobActions.SET_JOBS_SELECTED, job: data })),
                        catchError(err =>
                            of(JobActions.fetchJobsSelectedFailed({ job, err: err.message })))
                    )
                )
            )
        )
    ));

    deleteJob$ = createEffect(() => this.actions$.pipe(
        ofType(JobActions.DELETE_JOB),
        mergeMap(({ job }) => this.jobService.delete(job)
            .pipe(
                map(() => ({ type: JobActions.DELETE_JOB_SUCCESS, job }))
            ))
    ));

    /**
     * Delete jobs effect triggered on type deletejobs.
     * This effect expects an array of jobs. We spread the array
     * and then map through each job calling the delete endpoint
     * for a given job of which if successful we remove the job
     * from the jobs array or we raise an error.
     */
    deleteJobs$ = createEffect(() => this.actions$.pipe(
        ofType(JobActions.deleteJobs),
        exhaustMap(({ jobs }) => 
            merge(
                ...jobs.map(job =>
                    this.jobService.delete(job).pipe(
                        map(() => ({ type: JobActions.DELETE_JOB_SUCCESS, job })),
                        catchError(err =>
                            of(JobActions.deleteJobFailed({ job, err: err.message })))
                    )
                )
            )
        )
    ));
}