import { NgModule } from '@angular/core';

// Routing
import { TpActionsRoutingModule } from './tpactions-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TpActionComponent } from './tp-action/tp-action.component';
import { NotesModule } from '../notes/notes.module';

@NgModule({
  declarations: [
    TpActionComponent
  ],
  imports: [
    TpActionsRoutingModule,

    SharedModule,
    NotesModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class TpActionsModule {}