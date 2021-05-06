import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Components
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';

import { MarkerService } from './services/marker.service';
import { PopupService } from './services/popup.service';
import { ShapeService } from './services/shape.service';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Helpers
import { ErrorInterceptor, JwtInterceptor } from './helpers';
import { AlertComponent } from './components/alert/alert.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    HomeComponent, 
    MapComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    FontAwesomeModule,
    AppRoutingModule,
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
