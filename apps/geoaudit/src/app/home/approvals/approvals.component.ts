import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import qs from 'qs';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { StatusEntityService } from '../../entity-services/status-entity.service';
import { SurveyEntityService } from '../../entity-services/survey-entity.service';
import { SiteActionEntityService } from '../../entity-services/site-action-entity.service';
import { TpActionEntityService } from '../../entity-services/tp-action-entity.service';
import { TrActionEntityService } from '../../entity-services/tr-action-entity.service';
import { AbrioxActionEntityService } from '../../entity-services/abriox-action-entity.service';
import { ResistivityEntityService } from '../../entity-services/resistivity-entity.service';
import { NoteEntityService } from '../../entity-services/note-entity.service';
import { RefusalModalComponent } from '../../modals/refusal-modal/refusal-modal.component';
import { NOTIFICATION_DATA, Status, Statuses, Survey } from '../../models';
import { AlertService, AuthService } from '../../services';
import * as moment from 'moment';
import { ApproveListComponent } from '../../components/approve-list/approve-list.component';
import { SelectionService } from '../../services/selection.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'geoaudit-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
})
export class ApprovalsComponent implements OnInit {
  displayedColumns: Array<string> = [
    'select',
    'reference',
    'name',
    'date_delivery',
    'conducted_by',
    'job',
    'actions'
  ];

  fields = ['ID Reference', 'Name', 'Delivery Date', 'Conducted By', 'Job'];

  selection = new SelectionModel<Survey>(true, []);

  dataSource: MatTableDataSource<Survey>;

  refusedStatus: Status;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private statusEntityService: StatusEntityService,
    private surveyEntityService: SurveyEntityService,
    private siteActionEntityService: SiteActionEntityService,
    private tpActionEntityService: TpActionEntityService,
    private trActionEntityService: TrActionEntityService,
    private abrioxActionEntityService: AbrioxActionEntityService,
    private resistivityEntityService: ResistivityEntityService,
    private noteEntityService: NoteEntityService,
    private selectionService: SelectionService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.query();

    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.refusedStatus = statuses.find(
          (status) => status.name === Statuses.REFUSED
        );
      },
    );
    this.selectionService.setSurveyMarkerFilter.emit([]);
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void{
    this.selectionService.setSurveyMarkerFilter.emit(null);
  }

  query() {
    const parameters = qs.stringify({
      _where: {
        // "approved": false,
        'status.name': Statuses.COMPLETED,
      },
      _sort: 'created_at:DESC',
    });

    this.surveyEntityService.getWithQuery(parameters).subscribe(
      (surveys) => {
        this.dataSource = new MatTableDataSource(
          surveys.filter((survey) => !survey?.approved)
        );
      },

      (err) => {}
    );
  }

  approve() {
    if (this.selection.selected?.length <= 0) {
      return
    }

    const survey = this.selection.selected[0];
    this.surveyEntityService.getByKey(survey.id).subscribe((survey) => {
      console.log("survey~~~~~~~~~", survey);
      this.openApproveDialog(survey)
    })
  }

  private openApproveDialog(survey) {    
    //const testposts = [{ id: 1, text: 'Testpost 1' }, { id: 2, text: 'Testpost 2' }]
    const treeData = {
      [`Survey [${survey .reference}]`]: {
        // "Overview": null,
        // "Delivery details": null,
        // "Attachments": null,
        "Site details": survey.site_actions?.map((it, index) => {
          return {
            key: 'site',
            id: it.id,
            approved: it.approved,
            text: `Site ${index + 1}`,
          };
        }),
        "Testposts": survey.tp_actions?.map((it, index) => {
          return {
            key: 'tp_actions',
            id: it.id,
            approved: it.approved,
            text: `Tp_action ${index + 1}`,
          };
        }),
        "Transformer Rectifiers (Trs)": survey.tr_actions?.map((it, index) => {
          return {
            key: 'tr_actions',
            id: it.id,
            approved: it.approved,
            text: `Tr_action ${index + 1}`,
          };
        }),
        "Abrioxes": survey.abriox_actions?.map((it, index) => {
          return {
            key: 'abriox_actions',
            id: it.id,
            approved: it.approved,
            text: `Abriox ${index + 1}`,
          };
        }),
        "Resistivities": survey.resistivities?.map((it, index) => {
          return {
            key: 'resistivities',
            id: it.id,
            approved: it.approved,
            text: `Resistivity ${index + 1}`,
          };
        }),
        /*"Notes": survey.notes?.map((it, index) => {
          return {
            key: 'notes',
            id: it.id,
            approved: it.approved,
            text: `Note ${index + 1}`,
          };
        }),*/
      }
    }
    const dialogRef = this.dialog.open(ApproveListComponent, {
      data: {
        treeData: treeData
      },
      width: '100%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.approve && this.approveItems(survey, result.selected);
        result.refuse && this.refuseItems(survey, result.selected);
      }
    });
  }

  private approveItems(survey, items) {
    this.alertService.clear();
    const payload: any = {
      id: survey.id,
      approved: true,
      approved_by: this.authService.authValue.user.id
    };
    this.surveyEntityService.update(payload).subscribe(() => {
      this.alertService.info('Saved Changes');
    })
    
    items?.filter(item => item.key && item.level > 1 && !item.approved)
      .map(item => {
        const data = {...payload, id: item.id};
        const service = this.getEntityService(item.key);
        service?.update(data).subscribe(() => {
          this.alertService.info('Saved Changes');
        })
    })
  }

  private refuseItems(survey, items) {
    this.alertService.clear();
    const payload: any = {
      id: survey.id,
      approved: false,
      approved_by: 0,
    };
    this.surveyEntityService.update(payload).subscribe(() => {
      this.alertService.info('Saved Changes');
    })

    items?.filter(item => item.key && item.level > 1 && item.approved)
      .map(item => {
        const data = {...payload, id: item.id};
        const service = this.getEntityService(item.key);
        service?.update(data).subscribe(() => {
          this.alertService.info('Saved Changes');
        })
    })
  }

  private getEntityService(key) : any {
    if (key == 'site') {
      return this.siteActionEntityService;
    } else if (key == 'tp_actions') {
      return this.tpActionEntityService;
    } else if (key == 'tr_actions') {
      return this.trActionEntityService;
    } else if (key == 'abriox_actions') {
      return this.abrioxActionEntityService;
    } else if (key == 'resistivities') {
      return this.resistivityEntityService;
    } else if (key == 'notes') {
      return this.noteEntityService;
    }
    return null;
  }

  disapprove() {
    const surveys = this.selection.selected
    const dialogRef = this.dialog.open(RefusalModalComponent, {
      data: {
        surveys: surveys,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      surveys.map(survey => {
        const data: NOTIFICATION_DATA = {
          type: 'SURVEY_REFUSAL',
          subject: survey,
          message: result.message,
        };
        
        this.notificationService.post({
          source: this.authService.authValue.user,
          recipient: survey.conducted_by,
          data
        }).subscribe()
      });
      
      this.selection.selected.map((survey) => {
        this.surveyEntityService
          .update({
            ...survey,
            status: this.refusedStatus,
            approved: false,
          })
          .subscribe(
            (update) => {
              this.query();
            },

            (err) => {}
          );
      });
    });
  }

  getBody(): Array<any> {
    /**
     *
     */
    const surveys = this.selection.isEmpty()
      ? this.dataSource.data
      : this.selection.selected;

    return surveys.map((survey) => {
      return [
        survey.reference ? survey.reference : '',
        survey.name ? survey.name : '',
        survey.date_delivery ? moment(survey.date_delivery).format('L LT') : '',
        survey.conducted_by && survey.conducted_by.username
          ? survey.conducted_by.username
          : '',
        survey.job.reference ? survey.job.reference : '',
      ];
    });
  }

  print() {
    this.pdf(true);
  }

  download(): void {
    this.pdf();
    this.csv();
  }

  pdf(print = false) {
    const doc = new jsPDF({
      orientation: 'landscape',
    });
    // var finalY = doc.lastAutoTable.finalY || 10

    doc.setFontSize(40);
    doc.text(`Surveys`, 35, 25);

    autoTable(doc, {
      startY: 35,
      head: [this.fields],
      body: this.getBody(),
    });

    if (print) {
      doc.autoPrint();
      doc.output('dataurlnewwindow');
    } else {
      doc.save(`${moment().toISOString(true)}-survey-approval-list-download.pdf`);
    }
  }

  csv() {
    const csv = Papa.unparse({
      data: this.getBody(),
      fields: this.fields,
    });
    const blob = new Blob([csv]);

    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `${moment().toISOString(true)}-survey-download.csv`;
    document.body.appendChild(a);
    a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }

  isAllSelected() {
    if (this.dataSource) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear()
      this.selectionService.setSurveyMarkerFilter.emit([]);
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
      this.selectionService.setSurveyMarkerFilter.emit(this.dataSource.data);
    }
  }

  onCheckedRow(event, row) {
    event && this.selection.toggle(row);
    if (this.selection.selected.length == 0) {
      this.selectionService.setSurveyMarkerFilter.emit([]);
    } else {
      const surveys = this.selection.selected;
      this.selectionService.setSurveyMarkerFilter.emit(surveys);
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Survey): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }
}
