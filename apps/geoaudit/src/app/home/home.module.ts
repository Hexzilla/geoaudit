import { NgModule } from '@angular/core';

// Routing
import { HomeRoutingModule } from './home-routing.module';

// Declarations
import { HomeComponent } from './home.component';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { SearchComponent } from './search/search.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';
import { JobsComponent } from './jobs/jobs.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { SidebarActionsComponent } from '../components/sidebar-actions/sidebar-actions.component';

import { SharedModule } from './shared.module';

@NgModule({
  declarations: [
    HomeComponent,
    ToDoListComponent,
    SearchComponent,
    NotificationsComponent,
    ProfileComponent,
    JobsComponent,
    ApprovalsComponent,
    SidebarActionsComponent,
  ],
  imports: [
    HomeRoutingModule,

    SharedModule
  ]
})
export class HomeModule {}