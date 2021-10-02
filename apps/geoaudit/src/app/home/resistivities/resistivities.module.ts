import { NgModule } from '@angular/core';

// Routing
import { ResistivitiesRoutingModule } from './resistivities-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ResistivityComponent } from './resistivity/resistivity.component';
import { NotesModule } from '../notes/notes.module';

@NgModule({
  declarations: [
    ResistivityComponent,
  ],
  imports: [
    ResistivitiesRoutingModule,

    SharedModule,
    NotesModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class ResistivitiesModule {}