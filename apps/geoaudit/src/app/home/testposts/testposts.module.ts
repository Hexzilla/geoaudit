import { NgModule } from '@angular/core';

// Routing
import { TestpostsRoutingModule } from './testposts-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [
  ],
  imports: [
    TestpostsRoutingModule,

    SharedModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class TestpostsModule {}