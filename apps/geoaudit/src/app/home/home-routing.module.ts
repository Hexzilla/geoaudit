import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';
import { AuthGuard } from '../guards';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { SearchComponent } from './search/search.component';
import { CalendarComponent } from './calendar/calendar.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';
import { JobsComponent } from './jobs/jobs.component';
import { SurveysComponent } from './surveys/surveys.component';
import { ApprovalsComponent } from './approvals/approvals.component';

const routes: Routes = [
    { 
        path: '', component: HomeComponent, 
        canActivate: [AuthGuard],
        children: [
            {
                path: 'search', component: SearchComponent,
            },
            {
                path: 'calendar', component: CalendarComponent
            },
            {
                path: 'notifications', component: NotificationsComponent
            },
            {
                path: 'profile', component: ProfileComponent
            },
            {
                path: 'todolist', component: ToDoListComponent
            },
            {
                path: 'jobs', component: JobsComponent
            },
            {
                path: 'surveys', component: SurveysComponent
            },
            {
                path: 'approvals', component: ApprovalsComponent
            },
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