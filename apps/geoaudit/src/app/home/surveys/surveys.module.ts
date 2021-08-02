import { NgModule } from '@angular/core';

// Routing
import { SurveysRoutingModule } from './surveys-routing.module';

// Declarations
import { SurveysComponent } from './surveys.component';

import { SharedModule } from '../shared.module';
import { SurveyComponent } from './survey/survey.component';

@NgModule({
  declarations: [
    SurveysComponent,
    SurveyComponent
  ],
  imports: [
    SurveysRoutingModule,

    SharedModule
  ],
})
export class SurveysModule {}