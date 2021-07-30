import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const calendarModule = () => import('./calendar/calendar.module').then(x => x.CalendarModule);
const surveyModule = () => import('./survey/survey.module').then(x => x.SurveyModule);
const jobsModule = () => import('./jobs/jobs.module').then(x => x.JobsModule);

import { HomeComponent } from './home.component';
import { AuthGuard } from '../guards';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { SearchComponent } from './search/search.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { ArchiveComponent } from './archive/archive.component';

const routes: Routes = [
    { 
        path: '', component: HomeComponent, 
        canActivate: [AuthGuard],
        children: [
            {
                path: 'search', component: SearchComponent,
            },
            {
                path: 'calendar', loadChildren: calendarModule
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
                path: 'jobs', loadChildren: jobsModule,
            },
            {
                path: 'survey', loadChildren: surveyModule,
            },
            {
                path: 'approvals', component: ApprovalsComponent
            },
            {
                path: 'archive', component: ArchiveComponent
            },
            {
                path: 'abriox/:id', component: SearchComponent
            },
            {
                path: 'abriox/:id/history', component: SearchComponent
            },
            {
                path: 'abriox/:id/notes', component: SearchComponent
            },
            {
                path: 'abriox/:id/drive', component: SearchComponent
            },
            {
                path: 'testpost/:id', component: SearchComponent
            },
            {
                path: 'testpost/:id/history', component: SearchComponent
            },
            {
                path: 'testpost/:id/notes', component: SearchComponent
            },
            {
                path: 'testpost/:id/drive', component: SearchComponent
            },
            {
                path: 'tr/:id', component: SearchComponent
            },
            {
                path: 'tr/:id/history', component: SearchComponent
            },
            {
                path: 'tr/:id/notes', component: SearchComponent
            },
            {
                path: 'tr/:id/drive', component: SearchComponent
            },
            // {
            //     path: 'survey/:id', component: SearchComponent
            // },
            {
                path: 'resistivity/:id', component: SearchComponent
            },
            {
                path: 'resistivity/:id/history', component: SearchComponent
            },
            {
                path: 'resistivity/:id/notes', component: SearchComponent
            },
            {
                path: 'resistivity/:id/drive', component: SearchComponent
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