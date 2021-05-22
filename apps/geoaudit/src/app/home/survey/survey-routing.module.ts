import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyComponent } from './survey.component';

const routes: Routes = [
    { 
        path: '', component: SurveyComponent, 
    },
    { 
        path: ':id', component: SurveyComponent, 
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SurveyRoutingModule { }