import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Routing
import { HomeRoutingModule } from './home-routing.module';

// Helpers

import { HomeComponent } from './home.component';

import { CommonModule } from '@angular/common';
import { ToDoListComponent } from './to-do-list/to-do-list.component';

@NgModule({
  declarations: [
    HomeComponent,
    ToDoListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HomeRoutingModule,
    FontAwesomeModule,
  ],
  providers: [
  ],
})
export class HomeModule {}