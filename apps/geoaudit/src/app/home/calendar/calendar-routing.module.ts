import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../guards';
import { CalendarEventResolver } from '../../resolvers/calendar-event.resolver ';
import { CalendarEventsResolver } from '../../resolvers/calendar-events.resolver';
import { CalendarComponent } from './calendar.component';
import { EventComponent } from './event/event.component';

const routes: Routes = [
    { 
        path: '', component: CalendarComponent, 
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
    exports: [RouterModule],
    providers: [
        CalendarEventResolver,
        CalendarEventsResolver
    ]
})
export class CalendarRoutingModule { }