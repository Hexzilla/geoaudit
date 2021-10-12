import { NgModule } from '@angular/core';

// Routing
import { SurveysRoutingModule } from './surveys-routing.module';

// Declarations
import { SurveysComponent } from './surveys.component';

import { SharedModule } from '../shared.module';
import { SurveyComponent } from './survey/survey.component';
import { NotesModule } from '../notes/notes.module';
import { AbrioxListComponent } from './abriox-list/abriox-list.component';
import { AbrioxSelectModalComponent } from './abriox-select-modal/abriox-select-modal.component';
import { TpActionsComponent } from './tp-actions/tp-actions.component';
import { TrActionsComponent } from './tr-actions/tr-actions.component';
import { ResistivityListComponent } from './resistivity-list/resistivity-list.component';

@NgModule({
  declarations: [
    SurveysComponent,
    SurveyComponent,
    AbrioxListComponent,
    AbrioxSelectModalComponent,
    TpActionsComponent,
    TrActionsComponent,
    ResistivityListComponent,
  ],
  imports: [
    SurveysRoutingModule,

    SharedModule,
    NotesModule
  ],
})
export class SurveysModule {}