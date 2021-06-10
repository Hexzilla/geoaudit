import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Material
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatMenuModule} from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatStepperModule} from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';

// Modals
import { AttachmentModalComponent } from '../modals/attachment-modal/attachment-modal.component';
import { NavigationModalComponent } from '../modals/navigation-modal/navigation-modal.component';

// Custom
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule, NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { LightboxModule } from 'ngx-lightbox';

// Declarations
import { CardButtonComponent } from '../components/card-button/card-button.component';
import { FileUploadComponent } from '../components/file-upload/file-upload.component';
import { SidebarHeaderComponent } from '../components/sidebar-header/sidebar-header.component';
import { SidebarActionsComponent } from '../components/sidebar-actions/sidebar-actions.component';
import { SurveyTableComponent } from '../components/survey-table/survey-table.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EntityDataService, EntityDefinitionService, EntityMetadataMap } from '@ngrx/data';
import { StatusEntityService } from '../entity-services/status-entity.service';
import { StatusDataService } from '../data-services/status-data.service';
import { JwtInterceptor, ErrorInterceptor } from '../helpers';
import { JobTypeDataService } from '../data-services/job-type-data.service';
import { JobTypeEntityService } from '../entity-services/job-type-entity.service';
import { UserEntityService } from '../entity-services/user-entity.service';
import { UserDataService } from '../data-services/user-data.service';
import { UploadService } from '../services';
import { SurveyDataService } from '../data-services/survey-data.service';
import { SurveyEntityService } from '../entity-services/survey-entity.service';
import { JobDataService } from '../data-services/job-data.service';
import { JobEntityService } from '../entity-services/job-entity.service';

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

// If using Moment
const CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: "l, LT"
  },
  display: {
    dateInput: "ll, LT",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

const entityMetadataMap: EntityMetadataMap = {
  Status: {},
  Survey: {},
  Job: {
    // sortComparer: compareJo
    entityDispatcherOptions: {
      optimisticUpdate: true
    },
  },
  JobType: {},
  User: {}
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forChild({
      defaultLanguage: 'en-GB',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    FlexLayoutModule,

    FontAwesomeModule,

    // Material
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatTooltipModule,
    MatTableModule,

    // Custom
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    LightboxModule,
  ],
  declarations: [
    CardButtonComponent,
    FileUploadComponent,
    SidebarHeaderComponent,
    SidebarActionsComponent,
    AttachmentModalComponent,
    NavigationModalComponent,
    SurveyTableComponent
  ],
  providers: [
    JobEntityService,
    JobDataService,

    JobTypeEntityService,
    JobTypeDataService,

    StatusEntityService,
    StatusDataService,

    SurveyEntityService,
    SurveyDataService,

    UploadService,
    
    UserEntityService,
    UserDataService,

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS }
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    TranslateModule,

    FlexLayoutModule,

    FontAwesomeModule,
    
    // Declarations
    CardButtonComponent,
    FileUploadComponent,
    SidebarHeaderComponent,
    SidebarActionsComponent,
    AttachmentModalComponent,
    SurveyTableComponent,
    
    // Material
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatTooltipModule,
    MatTableModule,

    // Custom
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    LightboxModule

  ],
})
export class SharedModule {

  constructor(
    private entityDefinitionService: EntityDefinitionService,
    private entityDataService: EntityDataService,
    private jobDataService: JobDataService,
    private jobTypeDataService: JobTypeDataService,
    private statusDataService: StatusDataService,
    private surveyDataService: SurveyDataService,
    private userDataService: UserDataService
  ) {
    entityDefinitionService.registerMetadataMap(entityMetadataMap);

    // entityDataService.registerService('Status', statusDataService);
    entityDataService.registerServices(
      { Status: statusDataService,
        Survey: surveyDataService,
        Job: jobDataService,
        JobType: jobTypeDataService,
        User: userDataService
      }
    )
  }
}
