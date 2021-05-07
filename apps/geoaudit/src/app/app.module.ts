import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {MatSnackBarModule} from '@angular/material/snack-bar'; 

// Components
import { AppComponent } from './app.component';

import { MarkerService } from './services/marker.service';
import { PopupService } from './services/popup.service';
import { ShapeService } from './services/shape.service';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Helpers
import { ErrorInterceptor, JwtInterceptor } from './helpers';
import { AlertComponent } from './components/alert/alert.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    // Material
    MatSnackBarModule
  ],
  providers: [
    MarkerService,
    PopupService,
    ShapeService,
  
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
