import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';
import { EventsComponent } from './events.component';
import { EventComponent } from './event/event.component';

const routes: Routes = [
    { 
        path: '', component: EventsComponent, 
        canActivate: [AuthGuard],
    },

    {
        path: 'create', component: EventComponent
    },

    {
        path: ':id', component: EventComponent
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EventsRoutingModule { }