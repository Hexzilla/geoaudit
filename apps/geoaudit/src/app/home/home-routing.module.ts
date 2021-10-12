import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const abrioxesModule = () =>
  import('./abrioxes/abrioxes.module').then((x) => x.AbrioxesModule);
const abrioxActionsModule = () =>
  import('./abriox-actions/abriox-actions.module').then((x) => x.AbrioxActionsModule);
const eventsModule = () =>
  import('./events/events.module').then((x) => x.EventsModule);
const surveysModule = () =>
  import('./surveys/surveys.module').then((x) => x.SurveysModule);
const jobsModule = () => import('./jobs/jobs.module').then((x) => x.JobsModule);
const notesModule = () =>
  import('./notes/notes.module').then((x) => x.NotesModule);
const resistivitiesModule = () =>
  import('./resistivities/resistivities.module').then(
    (x) => x.ResistivitiesModule
  );
const sitesModule = () =>
  import('./sites/sites.module').then((x) => x.SitesModule);
const testpostsModule = () =>
  import('./testposts/testposts.module').then((x) => x.TestpostsModule);
const tpActionsModule = () =>
  import('./tpactions/tpactions.module').then((x) => x.TpActionsModule);
const trsModule = () => import('./trs/trs.module').then((x) => x.TrsModule);
const trActionsModule = () =>
  import('./tractions/tractions.module').then((x) => x.TrActionsModule);

const searchModule = () =>
  import('./search/search.module').then((x) => x.SearchModule);

import { HomeComponent } from './home.component';
import { AuthGuard } from '../guards';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
// import { SearchComponent } from './search/search.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { ArchiveComponent } from './archive/archive.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'search',
        // component: SearchComponent,
        loadChildren: searchModule,
      },
      {
        path: 'events',
        loadChildren: eventsModule,
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'todolist',
        component: ToDoListComponent,
      },

      {
        path: 'approvals',
        component: ApprovalsComponent,
      },
      {
        path: 'archive',
        component: ArchiveComponent,
      },
      {
        path: 'notes',
        loadChildren: notesModule,
      },

      {
        path: 'abrioxes',
        loadChildren: abrioxesModule,
      },

      {
        path: 'abriox_actions',
        loadChildren: abrioxActionsModule,
      },

      {
        path: 'jobs',
        loadChildren: jobsModule,
      },

      {
        path: 'resistivities',
        loadChildren: resistivitiesModule,
      },
      {
        path: 'sites',
        loadChildren: sitesModule,
      },

      {
        path: 'surveys',
        loadChildren: surveysModule,
      },

      {
        path: 'testposts',
        loadChildren: testpostsModule,
      },
      {
        path: 'tp_actions',
        loadChildren: tpActionsModule,
      },
      {
        path: 'trs',
        loadChildren: trsModule,
      },
      {
        path: 'tr_actions',
        loadChildren: trActionsModule,
      },
    ],
  },

  // otherwise redirect to home
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
