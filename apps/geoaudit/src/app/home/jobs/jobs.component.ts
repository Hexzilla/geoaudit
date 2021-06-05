import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { fromEvent } from 'rxjs';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { DeleteModalComponent } from '../../modals/delete-modal/delete-modal.component';
import { Job } from '../../models';

// Store
import * as fromApp from '../../store';
import * as JobActions from '../../store/job/job.actions';

@Component({
  selector: 'geoaudit-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select', 'reference', 'name', 'status', 'actions'];
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

  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>
  ) {
    this.form = this.formBuilder.group({
      filter: [''],
    });
  }

  ngOnInit(): void {
    this.store.dispatch(
      JobActions.countJobs({ start: 0, limit: this.pageSize })
    );
    
    this.store.dispatch(
      JobActions.fetchJobs({ start: 0, limit: this.pageSize })
    );

    this.store.select('job').subscribe((state) => {
      this.length = state.count;
      this.dataSource = new MatTableDataSource(state.jobs);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    /**
     * Uses rxjs to delay and cancel requests made to the backend
     * when filtering on jobs.
     *
     * https://www.freakyjolly.com/angular-rxjs-debounce-time-optimize-search-for-server-response/
     */
    //  fromEvent(this.input.nativeElement, 'keyup')
    this.filterCtrl.valueChanges
     .pipe(
      //  Map unrequired here as working with value directly
      //  map((event: any) => {
      //    return event.target.value;
      //  }),
       filter((res) => res.length >= 0),
       debounceTime(1000),
       distinctUntilChanged()
     )
     .subscribe((text: string) => {
       console.log('text', text)
       if (this.dataSource.paginator) {
         this.dataSource.paginator.firstPage();
       }

       this.store.dispatch(
         JobActions.fetchJobs({
           start: 0,
           limit: this.pageSize,
           filter: text,
         })
       );
     });
  }

  addJob(): void {
    this.router.navigate([`/home/jobs/job`]);
  }

  delete(): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      data: {
        length: this.selection.selected.length,
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result)
        this.store.dispatch(
          JobActions.deleteJobs({ jobs: this.selection.selected })
        );
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
        job.reference,
        job.name,
        job.status.name,
        job.job_type.name,
      ];
    });

    const fields = [
      'Job Reference',
      'Name',
      'Status',
      'Type'
    ];

    autoTable(doc, {
      startY: 35,
      head: [
        fields
      ],
      body,
    });

    doc.save(`${moment().toISOString(true)}-job-download.pdf`);

    const csv = Papa.unparse({
      data: body,
      fields
    });
    const blob = new Blob([csv]);

    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = `${moment().toISOString(true)}-job-download.csv`;
    document.body.appendChild(a);
    a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }

  details(id) {
    this.router.navigate([`/home/jobs/job/${id}`]);
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  get isRoot(): boolean {
    return this.router.url === '/home/jobs';
  }

  onPageEvent(event?: PageEvent) {
    this.store.dispatch(
      JobActions.fetchJobs({
        start: event.pageIndex * event.pageSize,
        limit: event.pageSize,
      })
    );
    return event;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
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
}
