import { NgModule } from '@angular/core';

// Routing
import { JobsRoutingModule } from './jobs-routing.module';

// Declarations
import { SharedModule } from '../shared.module';
import { JobComponent } from './job/job.component';
import { JobsComponent } from './jobs.component';

@NgModule({
  declarations: [
    JobsComponent,
    JobComponent,
  ],
  imports: [
    JobsRoutingModule,

    SharedModule
  ],
})
export class JobsModule {}