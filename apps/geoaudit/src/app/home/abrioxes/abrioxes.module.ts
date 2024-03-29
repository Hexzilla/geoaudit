import { NgModule } from '@angular/core';

// Routing
import { AbrioxesRoutingModule } from './abrioxes-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AbrioxComponent } from './abriox/abriox.component';
import { NotesModule } from '../notes/notes.module';

@NgModule({
  declarations: [
    AbrioxComponent,
  ],
  imports: [
    AbrioxesRoutingModule,

    SharedModule,
    NotesModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class AbrioxesModule {}