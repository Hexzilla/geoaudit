import { NgModule } from '@angular/core';

// Routing
import { TestpostsRoutingModule } from './testposts-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TestpostComponent } from './testpost/testpost.component';
import { NotesModule } from '../notes/notes.module';

@NgModule({
  declarations: [
  
    TestpostComponent
  ],
  imports: [
    TestpostsRoutingModule,

    SharedModule,
    NotesModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class TestpostsModule {}