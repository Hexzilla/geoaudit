import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotesComponent } from '../notes/notes.component';
import { SurveyComponent } from './survey/survey.component';

import { SurveysComponent } from './surveys.component';
import { TpActionsComponent } from './tp-actions/tp-actions.component';
import { TrActionsComponent } from './tr-actions/tr-actions.component';

const routes: Routes = [
  {
    path: '',
    component: SurveysComponent,
  },

  {
    path: 'notes',
    component: NotesComponent,
  },

  {
    path: 'create',
    component: SurveyComponent,
  },

  {
    path: ':id',
    component: SurveyComponent,
  },

  {
    path: ':id/notes',
    component: NotesComponent,
  },
  {
      path: ':id/drive', component: NotesComponent
  },
  {
      path: ':id/tp_action_list', component: TpActionsComponent,
  },
  {
      path: ':id/tr_action_list', component: TrActionsComponent,
  },

  // otherwise redirect to home
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule {}
