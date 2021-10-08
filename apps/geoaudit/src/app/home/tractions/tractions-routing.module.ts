import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';

import { NotesComponent } from '../notes/notes.component';
import { SearchComponent } from '../search/search.component';
import { TrActionComponent } from './tr-action/tr-action.component';

const routes: Routes = [
    { 
        path: '', component: SearchComponent, 
        canActivate: [AuthGuard],
    },

    {
        path: 'history', component: SearchComponent
    },

    {
        path: 'notes', component: NotesComponent
    },

    {
        path: 'drive', component: SearchComponent
    },

    {
        path: ':id', component: TrActionComponent
    },

    {
        path: ':id/notes', component: NotesComponent
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TractionsRoutingModule { }