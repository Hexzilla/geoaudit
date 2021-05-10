import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Material
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

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

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
    TranslateModule.forRoot({
      defaultLanguage: 'en-GB',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

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
