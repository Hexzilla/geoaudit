import { NgModule } from '@angular/core';

// Routing
import { SitesRoutingModule } from './sites-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SiteComponent } from './site/site.component';
import { NotesModule } from '../notes/notes.module';

@NgModule({
  declarations: [
    SiteComponent,
  ],
  imports: [
    SitesRoutingModule,

    SharedModule,
    NotesModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class SitesModule {}