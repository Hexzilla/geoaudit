import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';
import { AuthGuard } from '../guards';
import { ToDoListComponent } from './to-do-list/to-do-list.component';

const routes: Routes = [
    { 
        path: '', component: HomeComponent, 
        canActivate: [AuthGuard],
        children: [
            {
                path: 'abc', component: ToDoListComponent
            }
        ]
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule { }