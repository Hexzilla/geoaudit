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
import { TpActionEntityService } from '../../entity-services/tp-action-entity.service';
import { TrActionEntityService } from '../../entity-services/tr-action-entity.service';
import { AbrioxActionEntityService } from '../../entity-services/abriox-action-entity.service';
import { ResistivityEntityService } from '../../entity-services/resistivity-entity.service';
import { NoteEntityService } from '../../entity-services/note-entity.service';
import { RefusalModalComponent } from '../../modals/refusal-modal/refusal-modal.component';
import { Status, Statuses, Survey } from '../../models';
import { AuthService } from '../../services';
import * as moment from 'moment';
import { ApproveListComponent } from '../../components/approve-list/approve-list.component';
import { SelectionService } from '../../services/selection.service';

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
    'actions',
  ];

  fields = ['ID Reference', 'Name', 'Delivery Date', 'Conducted By', 'Job'];

  selection = new SelectionModel<Survey>(true, []);

  dataSource: MatTableDataSource<Survey>;

  refusedStatus: Status;

  constructor(
    private authService: AuthService,
    private statusEntityService: StatusEntityService,
    private surveyEntityService: SurveyEntityService,
    private tpActionEntityService: TpActionEntityService,
    private trActionEntityService: TrActionEntityService,
    private abrioxActionEntityService: AbrioxActionEntityService,
    private resistivityEntityService: ResistivityEntityService,
    private noteEntityService: NoteEntityService,
    private selectionService: SelectionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.query();

    this.statusEntityService.getAll().subscribe((statuses) => {
      this.refusedStatus = statuses.find(
        (status) => status.name === Statuses.REFUSED
      );
    });
    this.selectionService.setSurveyMarkerFilter.emit([]);
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void {
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
      return;
    }

    const survey = this.selection.selected[0];
    //const testposts = [{ id: 1, text: 'Testpost 1' }, { id: 2, text: 'Testpost 2' }]
    const treeData = {
      [`Survey [${survey.reference}]`]: {
        // "Overview": null,
        // "Delivery details": null,
        // "Attachments": null,
        // "Site details": null,
        Testposts: survey.tp_actions?.map((it, index) => {
          return {
            key: 'tp_actions',
            id: it.id,
            approved: it.approved,
            text: `Tp_action ${index + 1}`,
          };
        }),
        'Transformer Rectifiers (Trs)': survey.tr_actions?.map((it, index) => {
          return {
            key: 'tr_actions',
            id: it.id,
            approved: it.approved,
            text: `Tr_action ${index + 1}`,
          };
        }),
        Abrioxes: survey.abriox_actions?.map((it, index) => {
          return {
            key: 'abriox_actions',
            id: it.id,
            approved: it.approved,
            text: `Abriox ${index + 1}`,
          };
        }),
        Resistivities: survey.resistivities?.map((it, index) => {
          return {
            key: 'resistivities',
            id: it.id,
            approved: it.approved,
            text: `Resistivity ${index + 1}`,
          };
        }),
        Notes: survey.notes?.map((it, index) => {
          return {
            key: 'notes',
            id: it.id,
            approved: it.approved,
            text: `Note ${index + 1}`,
          };
        }),
      },
    };
    const dialogRef = this.dialog.open(ApproveListComponent, {
      data: {
        treeData: treeData,
      },
      width: '100%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      result.approve && this.approveItems(result.selected);
      result.refuse && this.refuseItems(result.selected);
    });
  }

  private approveItems(items) {
    items
      ?.filter((item) => item.key && item.level > 1 && !item.approved)
      .map((item) => {
        const payload = {
          id: item.id,
          approved: true,
          approved_by: this.authService.authValue.user.id,
        };
        const service = this.getEntityService(item.key);
        service?.update(payload);
      });
  }

  private refuseItems(items) {
    items
      ?.filter((item) => item.key && item.level > 1 && item.approved)
      .map((item) => {
        const payload = {
          id: item.id,
          approved: false,
        };
        const service = this.getEntityService(item.key);
        service?.update(payload);
      });
  }

  private getEntityService(key): any {
    if (key == 'tp_actions') {
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
    const dialogRef = this.dialog.open(RefusalModalComponent, {
      data: {
        surveys: this.selection.selected,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
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
    //this.pdf(true);

    const report = {
      content: [
        {
          image: 'sampleImage.jpg',
          width: 200,
        },
        //Survey general details
        {
          text: 'Survey <reference> - <name> ',
          style: 'header',
        },
        'This reposrt has been produced .... All the information are private and confidential, reserved to XXXXLtd',
        {
          text: 'Overview',
          style: 'subheader',
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              ['Job', '<job.reference>'],
              ['Reference', '<reference>'],
              ['Name', '<name>'],
              ['Status', '<status>'],
              ['Location', '<lat>, <lng>'],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              ['Date Assigned', '<date_assigned>'],
              ['Date Delivery', '<date_delivery>'],
              ['Prepared By', '<prepared_by>'],
              ['Conducted By', '<conducted_by>'],
            ],
          },
        },
        {
          text: 'Supportive documentation',
          style: 'subheader',
        },
        //SPACE FOR ATTACHEMENTS/images
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Images\n', bold: true, colSpan: 2 }, ''],
              ['', ''],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Documents\n', bold: true, colSpan: 2 }, ''],
              ['', ''],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Notes\n', bold: true, colSpan: 2 }, ''],
              ['<date>', '<description>'],
            ],
          },
        },

        //Survey Details
        { text: 'Survey Details ', style: 'header', pageBreak: 'before' },
        'This section gathers the survey information collected in field.',
        //Site Details
        //List
        { text: 'Site Details', style: 'subheader' },
        'This section includes the following sites',
        {
          ul: ['site <name>', 'site <name>', 'site <name>'],
        },

        //home/site_details/:id
        {
          text: 'Site <name>',
          style: 'subheader',
          fontSize: 12,
          italics: true,
        },
        //Tab Properties
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Properties\n', bold: true, colSpan: 2 }, ''],
              ['Reference', '<reference>'],
              ['Name', '<name>'],
              ['Date Installation', '<date_installation>'],
              ['Region', '<reference>'],
              ['Reference', '<region>'],
              ['Address', '<address>'],
              ['Scheme', '<scheme>'],
              ['Site Type', '<site_type.name>'],
            ],
          },
        },
        //Tab TM
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Traffic Management\n', bold: true, colSpan: 2 }, ''],
              ['Owner', '<owner>'],
              ['Access', '<access_detail>'],
              ['Speed Limit', '<speed_limit>'],
              ['Distance from road', '<distance_road>'],
              ['Road condition', '<road_condition>'],
              ['TM required?', '<tm_required>'],
              ['TM description', '<tm_descr>'],
              ['NRSWA required?', '<nrswa_required>'],
              ['NRSWA description', '<nrswa_description>'],
            ],
          },
        },
        //Tab H&S
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Health & Safety\n', bold: true, colSpan: 2 }, ''],
              ['Toilet Address', '<toilet>'],
              ['Hospital Address', '<hospital>'],
              ['Hazards', '<list of selected hazard.name>'],
            ],
          },
        },

        //Testposts
        { text: 'Testposts', style: 'subheader', pageBreak: 'before' },
        'This section includes the following testposts',
        {
          ul: [
            'Testpost <name> - <date>',
            'Testpost <name> - <date>',
            'Testpost <name> - <date>',
          ],
        },

        //home/testpost/:id/tp_action/:id
        {
          text: 'Testpost <name>',
          style: 'subheader',
          fontSize: 12,
          italics: true,
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              ['Date Inspection', '<date>'],
              ['Condition', '<condition.name>'],
            ],
          },
        },

        //Tab Readings
        {
          style: 'tableExample',
          table: {
            widths: [120, 30, 70, 30, 70, 30, '*'],
            body: [
              [
                { text: 'Readings\n', bold: true, colSpan: 7 },
                '',
                '',
                '',
                '',
                '',
                '',
              ],
              ['Pipe', 'ON', '', 'OFF', '', '', ''],
              [
                'Anodes',
                'ON',
                '<anode_on>',
                'OFF',
                '<anode_off>',
                'I',
                '<anodes_current>',
              ],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, 30, 70, 30, 70, 30, '*'],
            body: [
              [{ text: 'Groundbed', colSpan: 7 }, '', '', '', '', '', ''],
              [
                { text: 'Anode 1\n', italics: true, colSpan: 3 },
                '',
                '',
                'OFF',
                '<anode_off>',
                'I',
                '<anodes_current>',
              ],
              [
                { text: 'Anode 2\n', italics: true, colSpan: 3 },
                '',
                '',
                'OFF',
                '<anode_off>',
                'I',
                '<anodes_current>',
              ],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, 30, 70, 30, 70, 30, '*'],
            body: [
              [
                { text: 'Dead 1', italics: true },
                'ON',
                '<dead_on>',
                'OFF',
                '<dead_off>',
                'I',
                '<dead_current>',
              ],
              [
                { text: 'Dead 2', italics: true },
                'ON',
                '<dead_on>',
                'OFF',
                '<dead_off>',
                'I',
                '<dead_current>',
              ],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, 30, 70, 30, 70, 30, '*'],
            body: [
              [
                { text: 'Sleeve 1', italics: true },
                'ON',
                '<sleeve_on>',
                'OFF',
                '<sleeve_off>',
                'I',
                '<sleeve_current>',
              ],
              [
                { text: 'Sleeve 2', italics: true },
                'ON',
                '<sleeve_on>',
                'OFF',
                '<sleeve_off>',
                'I',
                '<sleeve_current>',
              ],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [80, 30, 'auto', 30, 'auto', 30, 'auto', 30, '*'],
            body: [
              [
                'Coupon 1',
                'ON',
                '<coupon_on>',
                'OFF',
                '<coupon_off>',
                'I-AC',
                '<coupon_current_ac>',
                'I-DC',
                '<coupon_current_dc>',
              ],
              [
                'Coupon 2',
                'ON',
                '<coupon_on>',
                'OFF',
                '<coupon_off>',
                'I-AC',
                '<coupon_current_ac>',
                'I-DC',
                '<coupon_current_dc>',
              ],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, 30, 70, 30, 70, 30, '*'],
            body: [
              [
                'Reed Switch',
                { text: 'reedswitch_quantity\n', colSpan: 6 },
                '',
                '',
                '',
                '',
                '',
              ],
              [
                'Reference cell',
                { text: 'reference_cell.name\n', colSpan: 6 },
                '',
                '',
                '',
                '',
                '',
              ],
            ],
          },
        },

        //Tab Current Drain
        {
          style: 'tableExample',
          table: {
            widths: [120, 100, 120, '*'],
            body: [
              [{ text: 'Current Drain 1', bold: true, colSpan: 4 }, '', '', ''],
              [
                'Input Potential',
                '<cd_input_v>',
                'Input Current',
                '<cd_input_a>',
              ],
              [
                'Output Potential',
                '<cd_output_v>',
                'Outut Current',
                '<cd_output_a>',
              ],
            ],
          },
        },

        //Tab Asset information
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Asset information\n', bold: true, colSpan: 2 }, ''],
              ['Pipe depth', '<pipe_depth>'],
              ['Reinstatement', '<reinstatement>'],
            ],
          },
        },

        //Tab Fault details
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Fault details 1\n', bold: true, colSpan: 2 }, ''],
              ['Fault Type', '<fault_type.name>'],
              ['Fault Description', '<fault_desc>'],
            ],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [[{ text: 'Comments', bold: true }], ['<comment>']],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Images', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Documents', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },

        //Trs
        {
          text: 'Transformer Rectifiers (Trs)',
          style: 'subheader',
          pageBreak: 'before',
        },
        'This section includes the following TRs',
        {
          ul: [
            'TR <name> - <date>',
            'TR <name> - <date>',
            'TR <name> - <date>',
          ],
        },

        //home/trs/:id/tr_action/:id
        { text: 'TR <name>', style: 'subheader', fontSize: 12, italics: true },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              ['Date Inspection', '<date>'],
              ['Condition', '<condition.name>'],
            ],
          },
        },

        //Tab Readings
        {
          style: 'tableExample',
          table: {
            widths: [120, 100, 120, '*'],
            body: [
              [{ text: 'Readings\n', bold: true, colSpan: 4 }, '', '', ''],
              ['Volt', '<Volt>', 'Ampere', '<Amps>'],
              [
                'Old Settings',
                { text: '<current_settings>', colSpan: 3 },
                '',
                '',
              ],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, 30, 70, 30, 70, 30, '*'],
            body: [
              [{ text: 'Groundbed', colSpan: 7 }, '', '', '', '', '', ''],
              [
                { text: 'Anode 1\n', italics: true, colSpan: 3 },
                '',
                '',
                'OFF',
                '<anode_off>',
                'I',
                '<anodes_current>',
              ],
              [
                { text: 'Anode 2\n', italics: true, colSpan: 3 },
                '',
                '',
                'OFF',
                '<anode_off>',
                'I',
                '<anodes_current>',
              ],
            ],
          },
        },

        //Tab Current Drain
        {
          style: 'tableExample',
          table: {
            widths: [120, 100, 120, '*'],
            body: [
              [{ text: 'Current Drain 1', bold: true, colSpan: 4 }, '', '', ''],
              [
                'Input Potential',
                '<cd_input_v>',
                'Input Current',
                '<cd_input_a>',
              ],
              [
                'Output Potential',
                '<cd_output_v>',
                'Outut Current',
                '<cd_output_a>',
              ],
            ],
          },
        },

        //Tab Fault details
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Fault details 1\n', bold: true, colSpan: 2 }, ''],
              ['Fault Type', '<fault_type.name>'],
              ['Fault Description', '<fault_desc>'],
            ],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [[{ text: 'Comments', bold: true }], ['<comment>']],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Images', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Documents', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },

        //Abriox
        { text: 'Abriox', style: 'subheader', pageBreak: 'before' },
        'This section includes the following abrioxes',
        {
          ul: [
            'Abriox <name> - <date>',
            'Abriox <name> - <date>',
            'Abriox <name> - <date>',
          ],
        },

        //home/abriox/:id/abriox_action/:id
        {
          text: 'Abriox <name>',
          style: 'subheader',
          fontSize: 12,
          italics: true,
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              ['Date Inspection', '<date>'],
              ['Condition', '<condition.name>'],
            ],
          },
        },

        //ABriox Details
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Details', bold: true, colSpan: 2 }, ''],
              ['telephone', '<telephone>'],
              ['serial_number', '<serial_number>'],
              ['serial_number', '<serial_number>'],
              ['date_installation', '<date_installation>'],
              ['tr', '<tr>'],
              ['testpost', '<testpost>'],
            ],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [[{ text: 'Comments', bold: true }], ['<comment>']],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Images', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Documents', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },

        //Resistivities
        { text: 'Resistivity', style: 'subheader', pageBreak: 'before' },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [
                { text: 'Resistivity <reference> \n', bold: true, colSpan: 2 },
                '',
              ],
              ['Date', '<date>'],
              ['Location', '<lat>, <lng>'],
              ['<distance>', '<value>'],
              ['<distance>', '<value>'],
              ['<distance>', '<value>'],
            ],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [[{ text: 'Comments', bold: true }], ['<comment>']],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Images', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Documents', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },

        //Completion
        { text: 'Completion', style: 'subheader' },
        'By providing my signature, I confirm and acknowledge that the information given in this form is true, complete and accurate',
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Signed By\n', bold: true, colSpan: 2 }, ''],
              ['<approved_by>', 'IMAGE OF SIGNATURE'],
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black',
        },
      },
      defaultStyle: {
        // alignment: 'justify'
      },
    };
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
      doc.save(
        `${moment().toISOString(true)}-survey-approval-list-download.pdf`
      );
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
      this.selection.clear();
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
