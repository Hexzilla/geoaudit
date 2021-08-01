import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Material
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatMenuModule} from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTabsModule} from '@angular/material/tabs';
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
import { AbrioxDataService } from '../data-services/abriox-data.service';
import { TestpostDataService } from '../data-services/testpost-data.service';
import { ResistivityDataService } from '../data-services/resistivity-data.service';
import { TrDataService } from '../data-services/tr-data.service';
import { UploadService } from '../services';
import { SurveyDataService } from '../data-services/survey-data.service';
import { SurveyEntityService } from '../entity-services/survey-entity.service';
import { JobDataService } from '../data-services/job-data.service';
import { JobEntityService } from '../entity-services/job-entity.service';
import { NotificationEntityService } from '../entity-services/notification-entity.service';
import { NotificationDataService } from '../data-services/notification-data.service';
import { ToDoListEntityService } from '../entity-services/to-do-list-entity.service';
import { ToDoListDataService } from '../data-services/to-do-list-data.service';
import { NotificationService } from '../services/notification.service';
import { NoteEntityService } from '../entity-services/note-entity.service';
import { NoteDataService } from '../data-services/note-data.service';
import { ItemSelectorComponent } from '../components/item-selector/item-selector.component';

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
  User: {},
  Abriox:{},
  Testpost:{},
  Tr:{},
  Resistivity:{},

  Note: {},

  Notification: {},

  ToDoList:{}
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
    MatBadgeModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatTabsModule,
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
    SurveyTableComponent,
    ItemSelectorComponent
  ],
  providers: [
    JobEntityService,
    JobDataService,

    JobTypeEntityService,
    JobTypeDataService,

    NoteEntityService,
    NoteDataService,

    NotificationEntityService,
    NotificationDataService,

    StatusEntityService,
    StatusDataService,

    SurveyEntityService,
    SurveyDataService,

    UploadService,
    
    UserEntityService,
    UserDataService,

    AbrioxDataService,

    TestpostDataService,
    
    TrDataService,
    
    ResistivityDataService,

    ToDoListEntityService,
    ToDoListDataService,

    NotificationService,

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
    ItemSelectorComponent,
    
    // Material
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatTabsModule,
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
    private noteDataService: NoteDataService,
    private notificationDataService: NotificationDataService,
    private statusDataService: StatusDataService,
    private surveyDataService: SurveyDataService,
    private userDataService: UserDataService,
    private abrioxDataService: AbrioxDataService,
    private testpostDataService: TestpostDataService,
    private trDataService: TrDataService,
    private resistivityDataService: ResistivityDataService,
    private toDoListDataService: ToDoListDataService
  ) {
    entityDefinitionService.registerMetadataMap(entityMetadataMap);

    // entityDataService.registerService('Status', statusDataService);
    entityDataService.registerServices(
      { Status: statusDataService,
        Survey: surveyDataService,
        Job: jobDataService,
        JobType: jobTypeDataService,
        User: userDataService,
        Abriox: abrioxDataService,
        Testpost: testpostDataService,
        Tr: trDataService,
        Resistivity: resistivityDataService,
        Note: noteDataService,
        Notification: notificationDataService,
        ToDoList: toDoListDataService
      }
    )
  }
}
