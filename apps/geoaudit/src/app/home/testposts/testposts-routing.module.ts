import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';

import { NotesComponent } from '../notes/notes.component';
import { SearchComponent } from '../search/search.component';
import { TestpostComponent } from './testpost/testpost.component';

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
        path: ':id', component: TestpostComponent
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
export class TestpostsRoutingModule { }