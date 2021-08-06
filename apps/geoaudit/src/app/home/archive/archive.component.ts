import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import qs from 'qs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import * as moment from 'moment';
import { JobEntityService } from '../../entity-services/job-entity.service';
import { Job } from '../../models';
import { AuthService } from '../../services';

@Component({
  selector: 'geoaudit-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
})
export class ArchiveComponent implements OnInit {
  isShowingAllJobs = false;

  displayedColumns: Array<String> = [
    'select',
    'reference',
    'name',
    'job_type',
    'approved_by',
    'surveys',
    'actions'
  ];

  dataSource: MatTableDataSource<Job>;

  selection = new SelectionModel<Job>(true, []);

  constructor(
    private authService: AuthService,
    private jobEntityService: JobEntityService
  ) {}

  ngOnInit(): void {
    this.query(false);
  }

  query(showAllJobs: boolean) {
    let where: any = {
      archived: true,
    };

    if (!showAllJobs) {
      this.isShowingAllJobs = false;
      where = {
        ...where,
        assignees: this.authService.authValue.user.id,
      };
    } else {
      this.isShowingAllJobs = true;
    }

    const parameters = qs.stringify({
      _where: where,
      _sort: 'created_at:DESC',
    });

    this.jobEntityService.getWithQuery(parameters).subscribe(
      (jobs) => {
        this.dataSource = new MatTableDataSource(jobs);
        console.log('jobs', jobs);
      },

      (err) => {}
    );
  }

  /** Whether the number of selected elements matches the total number of rows. */
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
  checkboxLabel(row?: Job): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  download(): void {
    const doc = new jsPDF({
      orientation: 'landscape',
    });
    // var finalY = doc.lastAutoTable.finalY || 10

    doc.setFontSize(40);
    doc.text(`Surveys`, 35, 25);

    /**
     *
     */
    const jobs = this.selection.isEmpty()
      ? this.dataSource.data
      : this.selection.selected;

    const body = jobs.map((job) => {
      return [
        job.reference ? job.reference : '',
        job.name ? job.name : '',
        job.job_type ? job.job_type.name : '',
        job.footer.approved_by ? job.footer.approved_by.username : '',
        job.surveys ? job.surveys.length : '',
      ];
    });

    const fields = [
      'ID Reference',
      'Name',
      'Job Type',
      'Approved By',
      'No of Surveys',
    ];

    autoTable(doc, {
      startY: 35,
      head: [fields],
      body,
    });

    doc.save(`${moment().toISOString(true)}-survey-download.pdf`);

    const csv = Papa.unparse({
      data: body,
      fields,
    });
    const blob = new Blob([csv]);

    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `${moment().toISOString(true)}-survey-download.csv`;
    document.body.appendChild(a);
    a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }
}
