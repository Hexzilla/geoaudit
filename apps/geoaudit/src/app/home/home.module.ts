import { NgModule } from '@angular/core';

// Routing
import { HomeRoutingModule } from './home-routing.module';

// Declarations
import { HomeComponent } from './home.component';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { SearchComponent } from './search/search.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';
import { ApprovalsComponent } from './approvals/approvals.component';

import { SharedModule } from './shared.module';
import { ShareModalComponent } from '../modals/share-modal/share-modal.component';
import { ArchiveComponent } from './archive/archive.component';

@NgModule({
  declarations: [
    HomeComponent,
    ToDoListComponent,
    SearchComponent,
    NotificationsComponent,
    ProfileComponent,
    ApprovalsComponent,

    ShareModalComponent,
     ArchiveComponent
  ],
  imports: [
    HomeRoutingModule,

    SharedModule
  ]
})
export class HomeModule {}