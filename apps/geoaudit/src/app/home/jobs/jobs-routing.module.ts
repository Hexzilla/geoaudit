import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';
import { JobsComponent } from './jobs.component'
import { JobComponent } from './job/job.component';

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

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class JobsRoutingModule { }