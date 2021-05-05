import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { MarkerService } from './services/marker.service';
import { PopupService } from './services/popup.service';
import { ShapeService } from './services/shape.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({ 
  declarations: [AppComponent, MapComponent],
  imports: [BrowserModule, HttpClientModule, FontAwesomeModule],
  providers: [MarkerService, PopupService, ShapeService],
  bootstrap: [AppComponent],
})
export class AppModule {}
