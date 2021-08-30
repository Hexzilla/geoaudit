import { NgModule } from '@angular/core';

// Routing
import { SurveysRoutingModule } from './surveys-routing.module';

// Declarations
import { SurveysComponent } from './surveys.component';

import { SharedModule } from '../shared.module';
import { SurveyComponent } from './survey/survey.component';
import { TpActionsComponent } from './tp-actions/tp-actions.component';

@NgModule({
  declarations: [
    SurveysComponent,
    SurveyComponent,
    TpActionsComponent
  ],
  imports: [
    SurveysRoutingModule,

    SharedModule
  ],
})
export class SurveysModule {}