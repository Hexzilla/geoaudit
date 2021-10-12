import { NgModule } from '@angular/core';

// Routing
import { AbrioxActionsRoutingModule } from './abriox-actions-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AbrioxActionComponent } from './abriox-action/abriox-action.component';
import { NotesModule } from '../notes/notes.module';

@NgModule({
  declarations: [
    AbrioxActionComponent
  ],
  imports: [
    AbrioxActionsRoutingModule,

    SharedModule,
    NotesModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class AbrioxActionsModule {}