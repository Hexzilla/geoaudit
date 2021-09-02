import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';

import { NotesComponent } from '../notes/notes.component';
import { SearchComponent } from '../search/search.component';
import { TestpostComponent } from './testpost/testpost.component';
import { TpActionComponent } from './tp-action/tp-action.component';

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

    // {
    //     path: 'create', component: AbrioxComponent
    // },

    {
        path: 'create', component: TestpostComponent
    },

    {
        path: ':id', component: TestpostComponent
    },

    {
        path: ':id/notes', component: NotesComponent
    },

    {
        path: ':id/tp_action/:action_id', component: TpActionComponent
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TestpostsRoutingModule { }