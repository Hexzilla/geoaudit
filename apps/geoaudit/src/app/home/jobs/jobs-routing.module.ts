import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';
import { JobsComponent } from './jobs.component'
import { JobComponent } from './job/job.component';
import { NotesComponent } from '../notes/notes.component';

const routes: Routes = [
    { 
        path: '', component: JobsComponent, 
        canActivate: [AuthGuard],
    },

    {
        path: 'notes', component: NotesComponent
    },

    {
        path: 'job', component: JobComponent
    },

    {
        path: 'job/:id', component: JobComponent
    },

    {
        path: 'job/:id/notes', component: NotesComponent
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class JobsRoutingModule { }