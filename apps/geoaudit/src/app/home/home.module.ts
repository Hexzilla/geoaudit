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

@NgModule({
  declarations: [
    HomeComponent,
    ToDoListComponent,
    CardButtonComponent
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