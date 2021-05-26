import { NgModule } from '@angular/core';
import { EntityDataService, EntityDefinitionService, EntityMetadataMap } from '@ngrx/data';

// Routing
import { JobsRoutingModule } from './jobs-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SharedModule } from '../shared.module';
import { JobComponent } from './job/job.component';
import { JobsComponent } from './jobs.component';
import { SurveysComponent } from './job/surveys/surveys.component';
import { JobEntityService } from '../../entity-services/job-entity.service';
import { JobDataService } from '../../data-services/job-data.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

const entityMetadataMap: EntityMetadataMap = {
  Job: {
    // sortComparer: compareJo
    entityDispatcherOptions: {
      optimisticUpdate: true
    },
  }
}

@NgModule({
  declarations: [
    JobsComponent,
    JobComponent,
    SurveysComponent,
  ],
  imports: [
    JobsRoutingModule,

    SharedModule,
  ],
  providers: [
    JobEntityService,
    JobDataService,

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class JobsModule {

  constructor(
    private entityDefinitionService: EntityDefinitionService,
    private entityDataService: EntityDataService,
    private jobDataService: JobDataService
  ) {
    entityDefinitionService.registerMetadataMap(entityMetadataMap);

    entityDataService.registerService('Job', jobDataService)
  }
}