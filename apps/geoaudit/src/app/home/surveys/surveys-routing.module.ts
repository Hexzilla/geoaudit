import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotesComponent } from '../notes/notes.component';
import { SurveyComponent } from './survey/survey.component';

import { SurveysComponent } from './surveys.component';

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

  // otherwise redirect to home
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule {}
