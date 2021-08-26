import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { fromEvent } from 'rxjs';
import Papa from 'papaparse';
import qs from 'qs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs/operators';
import { DeleteModalComponent } from '../../modals/delete-modal/delete-modal.component';
import { Job, Statuses } from '../../models';

// Store
import * as fromApp from '../../store';
import * as JobActions from '../../store/job/job.actions';
import { ShareModalComponent } from '../../modals/share-modal/share-modal.component';
import { JobEntityService } from '../../entity-services/job-entity.service';
import { SelectionService } from '../../services/selection.service';
import { AuthService } from '../../services';

@Component({
  selector: 'geoaudit-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnInit {
  displayedColumns: string[] = [
    'select',
    //'reference',
    'name',
    'status',
    'job_type',
    'actions',
  ];
  dataSource: MatTableDataSource<Job>;
  selection = new SelectionModel<Job>(true, []);

  filterCtrl = new FormControl();

  form: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input', { static: true }) input: ElementRef;

  // MatPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  jobs$ = this.jobEntityService.entities$;

  public chartSeries = null;

  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
    private jobEntityService: JobEntityService,
    private selectionService: SelectionService,
    private authService: AuthService
  ) {
    this.form = this.formBuilder.group({
      filter: [''],
    });
  }

  ngOnInit(): void {
    const parameters = qs.stringify({
      _where: {
        assignees: this.authService.authValue.user.id,
      },
      _sort: 'created_at:DESC',
    });

    this.jobEntityService.getWithQuery(parameters).subscribe(
      (jobs) => {
        this.updateJobChartSeries(jobs);
      },
      (err) => {
      }
    );

    this.jobs$.subscribe(
      (jobs) => {
        this.length = jobs.length;
        this.dataSource = new MatTableDataSource(jobs);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    )

    this.selectionService.setSurveyMarkerFilter.emit([]);
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void{
    this.selectionService.setSurveyMarkerFilter.emit(null);
  } 

  calendar(): void {
    const jobs = this.selection.isEmpty()
      ? this.dataSource.data
      : this.selection.selected;

    const jobIds = jobs.map((survey) => survey.id);

    // Add the array of values to the query parameter as a JSON string
    const queryParams = {
      jobs: JSON.stringify(jobIds),
    };

    // Create our 'NaviationExtras' object which is expected by the Angular Router
    const navigationExtras: NavigationExtras = {
      queryParams,
    };

    this.router.navigate([`/home/events/create`], navigationExtras);
  }

  share(): void {
    // this.selection.selected

    // Capture selected job

    // Open share modal with data and do the rest there.

    const dialogRef = this.dialog.open(ShareModalComponent, {
      data: {
        job: this.selection.selected[0],
      },
      width: '50%',
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  addJob(): void {
    this.router.navigate([`/home/jobs/create`]);
  }

  delete(): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      data: {
        length: this.selection.selected.length,
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.selection.selected.map((job) => {
        this.jobEntityService.delete(job).subscribe(
          (res) => {},

          (err) => {}
        );
      });
    });
  }

  download(): void {
    const doc = new jsPDF({
      orientation: 'landscape',
    });
    // var finalY = doc.lastAutoTable.finalY || 10

    doc.setFontSize(40);
    doc.text(`Jobs`, 35, 25);

    /**
     *
     */
    const jobs = this.selection.isEmpty()
      ? this.dataSource.data
      : this.selection.selected;

    const body = jobs.map((job: any) => {
      return [
        job?.reference,
        job?.name,
        job?.status?.name,
        job?.job_type?.name,
      ];
    });

    const fields = ['Job Reference', 'Name', 'Status', 'Type'];

    autoTable(doc, {
      startY: 35,
      head: [fields],
      body,
    });

    doc.save(`${moment().toISOString(true)}-job-download.pdf`);

    const csv = Papa.unparse({
      data: body,
      fields,
    });
    const blob = new Blob([csv]);

    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `${moment().toISOString(true)}-job-download.csv`;
    document.body.appendChild(a);
    a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }

  details(id) {
    this.router.navigate([`/home/jobs/${id}`]);
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  get isRoot(): boolean {
    return this.router.url === '/home/jobs';
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource?.data.forEach((row) => this.selection.select(row));
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

  private updateJobChartSeries(jobs) {
    const validJobs = jobs.filter(it => it.status != null);
    const notStartedJobs = validJobs.filter(it => it.status.name === Statuses.NOT_STARTED)
    const onGoingJobs = validJobs.filter(it => it.status.name === Statuses.ONGOING)
    const completedJobs = validJobs.filter(it => it.status.name === Statuses.COMPLETED)
    const refusedJobs = validJobs.filter(it => it.status.name === Statuses.REFUSED)

    this.chartSeries = []
    if (notStartedJobs.length > 0) {
      this.chartSeries.push({
        name: Statuses.NOT_STARTED,
        data: [notStartedJobs.length],
        color: '#E71D36',
      })
    }
    if (onGoingJobs.length > 0) {
      this.chartSeries.push({
        name: Statuses.ONGOING,
        data: [onGoingJobs.length],
        color: '#FFBE0B',
      })
    }
    if (completedJobs.length > 0) {
      this.chartSeries.push({
        name: Statuses.COMPLETED,
        data: [completedJobs.length],
        color: '#8AC926',
      })
    }
    if (refusedJobs.length > 0) {
      this.chartSeries.push({
        name: Statuses.REFUSED,
        data: [refusedJobs.length],
        color: '#3A86FF',
      })
    }
  }

  onCheckedRow(event, selections) {
    if (selections.selected.length == 0) {
      this.jobs$.subscribe(
        () => {
          /*const surveys = jobs.reduce((_surveys, job) => {
            return _surveys.concat(job.surveys)
          }, [])*/
          this.selectionService.setSurveyMarkerFilter.emit([]);
        }
      )
    }
    else {
      const surveys = selections.selected.reduce((_surveys, job) => {
        return _surveys.concat(job.surveys)
      }, [])
      this.selectionService.setSurveyMarkerFilter.emit(surveys);
    }
  }
}
