import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';
import { JobsComponent } from './jobs.component'
import { DetailsComponent } from './job/details/details.component';;
import { SurveysComponent } from './job/surveys/surveys.component';
import { JobComponent } from './job/job.component';
import { AttachmentsComponent } from './job/attachments/attachments.component';

const routes: Routes = [
    { 
        path: '', component: JobsComponent, 
        canActivate: [AuthGuard],
    },

    {
        path: 'job', component: DetailsComponent
    },

    {
        path: 'job/:id', component: JobComponent
    },

    {
        path: 'job/:id/details', component: DetailsComponent
    },

    {
        path: 'job/:id/attachments', component: AttachmentsComponent
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