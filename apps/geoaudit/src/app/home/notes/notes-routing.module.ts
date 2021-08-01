import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';
import { NoteComponent } from './note/note.component';
import { NotesComponent } from './notes.component';

const routes: Routes = [
    { 
        path: '', component: NotesComponent, 
        canActivate: [AuthGuard],
    },

    {
        path: 'create', component: NoteComponent
    },

    {
        path: ':id', component: NoteComponent
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NotesRoutingModule { }