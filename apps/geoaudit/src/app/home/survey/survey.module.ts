import { NgModule } from '@angular/core';

// Routing
import { SurveyRoutingModule } from './survey-routing.module';

// Declarations
import { SurveyComponent } from './survey.component';

import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [
    SurveyComponent,
  ],
  imports: [
    SurveyRoutingModule,

    SharedModule
  ],
})
export class SurveyModule {}