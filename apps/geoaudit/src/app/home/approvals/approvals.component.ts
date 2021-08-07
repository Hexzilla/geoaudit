import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import qs from 'qs';
import { StatusEntityService } from '../../entity-services/status-entity.service';
import { SurveyEntityService } from '../../entity-services/survey-entity.service';
import { RefusalModalComponent } from '../../modals/refusal-modal/refusal-modal.component';
import { Status, Statuses, Survey } from '../../models';
import { AuthService } from '../../services';

@Component({
  selector: 'geoaudit-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
})
export class ApprovalsComponent implements OnInit {
  displayedColumns: Array<String> = [
    'select',
    'reference',
    'name',
    'date_delivery',
    'conducted_by',
    'job',
  ];

  selection = new SelectionModel<Survey>(true, []);

  dataSource: MatTableDataSource<Survey>;

  refusedStatus: Status;

  constructor(
    private authService: AuthService,
    private statusEntityService: StatusEntityService,
    private surveyEntityService: SurveyEntityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.query();

    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.refusedStatus = statuses.find(status => status.name === Statuses.REFUSED);
      },

      (err) => {}
    )
  }

  query() {
    const parameters = qs.stringify({
      _where: {
        // "footer.approved": false,
        'status.name': Statuses.COMPLETED,
      },
      _sort: 'created_at:DESC',
    });

    this.surveyEntityService.getWithQuery(parameters).subscribe(
      (surveys) => {
        this.dataSource = new MatTableDataSource(
          surveys.filter((survey) => !survey?.footer?.approved)
        );
      },

      (err) => {}
    );
  }

  approve() {
    this.selection.selected.map((survey) => {
      this.surveyEntityService
        .update({
          ...survey,
          footer: {
            ...survey?.footer,
            approved: true,
            approved_by: this.authService.authValue.user,
          },
        })
        .subscribe(
          (update) => {
            console.log('update', update);
            this.query();
          },

          (err) => {}
        );
    });
  }

  disapprove() {

    const dialogRef = this.dialog.open(RefusalModalComponent, {
      data: {
        surveys: this.selection.selected
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.selection.selected.map((survey) => {
        this.surveyEntityService
          .update({
            ...survey,
            status: this.refusedStatus,
            footer: {
              ...survey?.footer,
              approved: false,
            },
          })
          .subscribe(
            (update) => {
              console.log('update', update);
              this.query();
            },
  
            (err) => {}
          );
      });
    });
  }

  print() {}

  download() {}

  isAllSelected() {
    if (this.dataSource) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
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
