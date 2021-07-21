import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AgmCoreModule } from '@agm/core';

// Material
import { MatButtonModule } from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './store';
import { SurveyEffects } from './store/survey/survey.effects';
import { DeleteModalComponent } from './modals/delete-modal/delete-modal.component';
import { CalendarEventEffects } from './store/calendar-event/calendar-event.effects';
import { JobEffects } from './store/job/job.effects';
import { DefaultDataServiceConfig, EntityDataModule } from '@ngrx/data';
import { entityConfig } from './entity-metadata';
import { ShareModalComponent } from './modals/share-modal/share-modal.component';
// import { SidebarHeaderComponent } from './components/sidebar-header/sidebar-header.component';

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function(state, action) {
    // console.log('state', state);
    // console.log('action', action);
 
    return reducer(state, action);
  };
}
 
export const metaReducers: MetaReducer<any>[] = [debug];

const defaultDataServiceConfig: DefaultDataServiceConfig = {
  root: environment.API_URL
}

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    DeleteModalComponent,
    ShareModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en-GB',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    
    AgmCoreModule.forRoot({
      apiKey: environment.google.apikey,
      libraries: ['places']
    }),

    // Material
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,

    StoreModule.forRoot(reducers, { metaReducers }),

    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),

    EffectsModule.forRoot([CalendarEventEffects, JobEffects, SurveyEffects]),

    EntityDataModule.forRoot(entityConfig),

    
  ],
  providers: [
    MarkerService,
    PopupService,
    ShapeService,
  
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    { provide: DefaultDataServiceConfig, useValue: defaultDataServiceConfig }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
