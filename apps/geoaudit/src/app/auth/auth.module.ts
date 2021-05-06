import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import {MatButtonModule} from '@angular/material/button'; 
import {MatCardModule} from '@angular/material/card'; 
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import { AuthRoutingModule } from './auth-routing.module';
import { LayoutComponent } from './layout.component';
import { LoginComponent } from './login.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AuthRoutingModule,
        FlexLayoutModule,

        // Material
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule
    ],
    declarations: [
        LayoutComponent,
        LoginComponent,
    ]
})
export class AuthModule { }