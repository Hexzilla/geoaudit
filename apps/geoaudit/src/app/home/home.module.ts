import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Material
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon'; 

// Routing
import { HomeRoutingModule } from './home-routing.module';

// Helpers

import { HomeComponent } from './home.component';

import { CommonModule } from '@angular/common';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { CardButtonComponent } from '../components/card-button/card-button.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SearchComponent } from './search/search.component';
import { CalendarComponent } from './calendar/calendar.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';
import { JobsComponent } from './jobs/jobs.component';
import { SurveysComponent } from './surveys/surveys.component';
import { ApprovalsComponent } from './approvals/approvals.component';

@NgModule({
  declarations: [
    HomeComponent,
    ToDoListComponent,
    CardButtonComponent,
    SearchComponent,
    CalendarComponent,
    NotificationsComponent,
    ProfileComponent,
    JobsComponent,
    SurveysComponent,
    ApprovalsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HomeRoutingModule,
    FontAwesomeModule,
    FlexLayoutModule,

    // Material
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  providers: [
  ],
})
export class HomeModule {}