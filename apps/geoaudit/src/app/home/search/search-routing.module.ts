import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';
import { SearchComponent } from './search.component'
import { ListComponent } from './list/list.component';
import { NotesComponent } from '../notes/notes.component';

const routes: Routes = [
    { 
        path: '', component: SearchComponent, 
        canActivate: [AuthGuard],
    },

    {
        path: ':category', component: ListComponent
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
export class SearchRoutingModule { }