import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';
import { CalendarComponent } from './calendar.component';
import { EventComponent } from './event/event.component';

const routes: Routes = [
    { 
        path: '', component: CalendarComponent, 
        canActivate: [AuthGuard],
        children: [
            {
                path: 'event', component: EventComponent,
            },
            {
                path: 'event/:id', component: EventComponent,
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
export class CalendarRoutingModule { }