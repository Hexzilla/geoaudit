import { NgModule } from '@angular/core';

// Routing
import { JobsRoutingModule } from './jobs-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { JobsComponent } from './jobs.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JobComponent } from './job/job.component';

@NgModule({
  declarations: [
    JobsComponent,
    JobComponent,
  ],
  imports: [
    JobsRoutingModule,

    SharedModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class JobsModule {}