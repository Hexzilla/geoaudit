import { NgModule } from '@angular/core';

// Routing
import { SurveysRoutingModule } from './surveys-routing.module';

// Declarations
import { SurveysComponent } from './surveys.component';

import { SharedModule } from '../shared.module';
import { SurveyComponent } from './survey/survey.component';
import { NotesModule } from '../notes/notes.module';

@NgModule({
  declarations: [
    SurveysComponent,
    SurveyComponent
  ],
  imports: [
    SurveysRoutingModule,

    SharedModule,
    NotesModule
  ],
})
export class SurveysModule {}