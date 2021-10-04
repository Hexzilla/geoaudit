import { NgModule } from '@angular/core';

// Routing
import { TrsRoutingModule } from './trs-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TrComponent } from './tr/tr.component';
import { TrActionComponent } from './tr-action/tr-action.component';
import { NotesModule } from '../notes/notes.module';

@NgModule({
  declarations: [
    TrComponent,
    TrActionComponent
  ],
  imports: [
    TrsRoutingModule,

    SharedModule,
    NotesModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class TrsModule {}