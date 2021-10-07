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
import { MatTreeModule } from '@angular/material/tree';
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
import { NgApexchartsModule } from "ng-apexcharts";

// Modals
import { AttachmentModalComponent } from '../modals/attachment-modal/attachment-modal.component';
import { NavigationModalComponent } from '../modals/navigation-modal/navigation-modal.component';
import { RefusalModalComponent } from '../modals/refusal-modal/refusal-modal.component';
// Custom
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule, NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { LightboxModule } from 'ngx-lightbox';

// Declarations
import { CardButtonComponent } from '../components/card-button/card-button.component';
import { FileUploadComponent } from '../components/file-upload/file-upload.component';
import { AttachmentUploadComponent } from '../components/file-upload/attachment-upload.component';
import { StatusButtonsComponent } from '../components/status-buttons/status-buttons.component';
import { ActionListItemComponent } from '../components/action-list-item/action-list-item.component';

import { SidebarHeaderComponent } from '../components/sidebar-header/sidebar-header.component';
import { ProgressChartComponent } from '../components/progress-chart/progress-chart.component';
import { SidebarActionsComponent } from '../components/sidebar-actions/sidebar-actions.component';
import { SurveyTableComponent } from '../components/survey-table/survey-table.component';
import { ApproveListComponent } from '../components/approve-list/approve-list.component';

import { ArchiveModalComponent } from '../modals/archive-modal/archive-modal.component';

import { IconComponent } from '../components/icon/icon.component';

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
import { AbrioxEntityService } from '../entity-services/abriox-entity.service';
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
import { MultiItemSelectorComponent } from '../components/multi-item-selector/multi-item-selector.component';
import { SiteEntityService } from '../entity-services/site-entity.service';
import { SiteDataService } from '../data-services/site-data.service';
import { EventDataService } from '../data-services/event-data.service';
import { EventEntityService } from '../entity-services/event-entity.service';
import { SingleItemSelectorComponent } from '../components/single-item-selector/single-item-selector.component';
import { ConditionEntityService } from '../entity-services/condition-entity.service';
import { ConditionDataService } from '../data-services/condition-data.service';
import { SiteActionEntityService } from '../entity-services/site-action-entity.service';
import { SiteActionDataService } from '../data-services/site-action-data.service';
import { TpActionDataService } from '../data-services/tp-action-data.service';
import { TrActionDataService } from '../data-services/tr-action-data.service';
import { TpActionEntityService } from '../entity-services/tp-action-entity.service';
import { TrActionEntityService } from '../entity-services/tr-action-entity.service';
import { AbrioxActionEntityService } from '../entity-services/abriox-action-entity.service';
import { AbrioxActionDataService } from '../data-services/abriox-action-data.service';
import { FaultTypeDataService } from '../data-services/fault-type-data.service';
import { FaultTypeEntityService } from '../entity-services/fault-type-entity.service';
import { ReferenceCellDataService } from '../data-services/reference-cell-data.service';
import { ReferenceCellEntityService } from '../entity-services/reference-cell-entity.service';
import { SiteTypeDataService } from '../data-services/site-type-data.service';
import { SiteTypeEntityService } from '../entity-services/site-type-entity.service';

import { SurveyActionButtonComponent } from '../components/survey-action-button/survey-action-button.component';
import { MyJobEntityService } from '../entity-services/my-job-entity.service';
import { MyJobDataService } from '../data-services/my-job-data.service';

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

  AbrioxAction: {},

  Condition: {},

  Event: {},

  Status: {},
  Survey: {},
  Job: {
    // sortComparer: compareJo
    entityDispatcherOptions: {
      optimisticUpdate: true
    },
  },
  JobType: {},
  FaultType: {},
  SiteType: {},
  ReferenceCell: {},
  User: {},
  Abriox:{},
  Testpost:{},
  Tr:{},
  Resistivity:{},

  Site: {},
  SiteAction: {},

  Note: {},

  Notification: {},

  ToDoList:{},

  TpAction: {},
  TrAction: {},

  MyJob: {}
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
    MatTreeModule,
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
    NgApexchartsModule,
  ],
  declarations: [
    CardButtonComponent,
    FileUploadComponent,
    AttachmentUploadComponent,
    StatusButtonsComponent,
    SidebarHeaderComponent,
    ProgressChartComponent,
    SidebarActionsComponent,
    AttachmentModalComponent,
    NavigationModalComponent,
    RefusalModalComponent,
    SurveyTableComponent,
    ApproveListComponent,
    MultiItemSelectorComponent,
    SingleItemSelectorComponent,
    IconComponent,
    SurveyActionButtonComponent,
    ActionListItemComponent,
    ArchiveModalComponent
  ],
  providers: [

    AbrioxActionEntityService,
    AbrioxActionDataService,

    ConditionEntityService,
    ConditionDataService,
    
    EventEntityService,
    EventDataService,
    
    JobEntityService,
    JobDataService,

    JobTypeEntityService,
    JobTypeDataService,

    FaultTypeDataService,
    FaultTypeEntityService,

    SiteTypeDataService,
    SiteTypeEntityService,

    ReferenceCellDataService,
    ReferenceCellEntityService,

    MyJobEntityService,
    MyJobDataService,

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
    AbrioxEntityService,

    TestpostDataService,

    TpActionDataService,
    TrActionDataService,
    TpActionEntityService,
    TrActionEntityService,
    SiteActionEntityService,
    SiteActionDataService,
    
    TrDataService,
    
    ResistivityDataService,

    ToDoListEntityService,
    ToDoListDataService,

    NotificationService,

    SiteEntityService,
    SiteDataService,

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
    AttachmentUploadComponent,
    StatusButtonsComponent,
    SidebarHeaderComponent,
    ProgressChartComponent,
    SidebarActionsComponent,
    AttachmentModalComponent,
    RefusalModalComponent,
    SurveyTableComponent,
    MultiItemSelectorComponent,
    SingleItemSelectorComponent,
    IconComponent,
    SurveyActionButtonComponent,
    ActionListItemComponent,
    ArchiveModalComponent,
    
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

    private abrioxActionDataService: AbrioxActionDataService,
    private conditionDataService: ConditionDataService,
    private eventDataService: EventDataService,
    private jobDataService: JobDataService,
    private jobTypeDataService: JobTypeDataService,
    private faultTypeDataService: FaultTypeDataService,
    private siteTypeDataService: SiteTypeDataService,
    private referenceCellDataService: ReferenceCellDataService,
    private myJobDataService: MyJobDataService,
    private noteDataService: NoteDataService,
    private notificationDataService: NotificationDataService,
    private statusDataService: StatusDataService,
    private surveyDataService: SurveyDataService,
    private userDataService: UserDataService,
    private abrioxDataService: AbrioxDataService,
    private testpostDataService: TestpostDataService,
    private tpActionDataService: TpActionDataService,
    private trActionDataService: TrActionDataService,
    private trDataService: TrDataService,
    private resistivityDataService: ResistivityDataService,
    private toDoListDataService: ToDoListDataService,
    private siteDataService: SiteDataService,
    private siteActionDataService: SiteActionDataService
  ) {
    entityDefinitionService.registerMetadataMap(entityMetadataMap);

    // entityDataService.registerService('Status', statusDataService);
    entityDataService.registerServices(
      { 
        AbrioxAction: abrioxActionDataService,
        Condition: conditionDataService,
        Event: eventDataService,
        Status: statusDataService,
        Survey: surveyDataService,
        Job: jobDataService,
        JobType: jobTypeDataService,
        FaultType: faultTypeDataService,
        SiteType: siteTypeDataService,
        ReferenceCell: referenceCellDataService,
        MyJob: myJobDataService,
        User: userDataService,
        Abriox: abrioxDataService,
        Testpost: testpostDataService,
        TpAction: tpActionDataService,
        TrAction: trActionDataService,
        Tr: trDataService,
        Resistivity: resistivityDataService,
        Note: noteDataService,
        Notification: notificationDataService,
        ToDoList: toDoListDataService,
        Site: siteDataService,
        SiteAction: siteActionDataService
      }
    )
  }
}
