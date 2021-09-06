import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';

import { NotesComponent } from '../notes/notes.component';
import { SearchComponent } from '../search/search.component';
import { AbrioxComponent } from './abriox/abriox.component';
import { AbrioxActionComponent } from './abriox-action/abriox-action.component';

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
        path: 'create', component: AbrioxComponent
    },

    {
        path: ':id', component: AbrioxComponent
    },

    {
        path: ':id/notes', component: NotesComponent
    },

    {
        path: ':id/abriox_action/:actionId', component: AbrioxActionComponent
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AbrioxesRoutingModule { }