import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import qs from 'qs';
import { SurveyEntityService } from '../../entity-services/survey-entity.service';
import { Statuses, Survey } from '../../models';

@Component({
  selector: 'geoaudit-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss']
})
export class ApprovalsComponent implements OnInit {

  displayedColumns: Array<String> = [
    'select',
    'reference',
    'name',
    'date_delivery',
    'conducted_by',
    'job'
  ];

  selection = new SelectionModel<Survey>(true, []);

  dataSource: MatTableDataSource<Survey>;

  constructor(
    private surveyEntityService: SurveyEntityService
  ) { }

  ngOnInit(): void {
    const parameters = qs.stringify({
      _where: {
        // "footer.approved": false,
        "status.name": Statuses.COMPLETED
      },
      _sort: 'created_at:DESC'
    })

    this.surveyEntityService.getWithQuery(parameters).subscribe(
      (surveys) => {
        this.dataSource = new MatTableDataSource(surveys.filter(survey => !survey?.footer?.approved));
      },

      (err) => {}
    )
  }

  approve() {}

  disapprove() {}

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
