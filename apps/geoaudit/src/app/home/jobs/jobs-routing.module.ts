import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';
import { JobComponent } from './job/job.component';
import { JobsComponent } from './jobs.component';
import { SurveysComponent } from './job/surveys/surveys.component';

const routes: Routes = [
    { 
        path: '', component: JobsComponent, 
        canActivate: [AuthGuard],
    },

    {
        path: 'job', component: JobComponent
    },

    {
        path: 'job/:id', component: JobComponent
    },

    {
        path: 'job/:id/surveys', component: SurveysComponent
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class JobsRoutingModule { }