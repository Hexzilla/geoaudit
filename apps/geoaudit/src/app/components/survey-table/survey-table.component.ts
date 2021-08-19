import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  EventEmitter,
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';
import Papa from 'papaparse';
import { fromEvent } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs/operators';

import { DeleteModalComponent } from '../../modals/delete-modal/delete-modal.component';
import { NavigationModalComponent } from '../../modals/navigation-modal/navigation-modal.component';
import { Job, Survey, Roles } from '../../models';
import { AuthService } from '../../services';

import * as fromApp from '../../store';
import * as SurveyActions from '../../store/survey/survey.actions';

@Component({
  selector: 'geoaudit-survey-table',
  templateUrl: './survey-table.component.html',
  styleUrls: ['./survey-table.component.scss'],
})
export class SurveyTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'select',
    'name',
    'date_delivery',
    'status',
    'actions',
  ];

  form: FormGroup;

  // MatPaginator Output
  pageEvent: PageEvent;

  selection = new SelectionModel<Survey>(true, []);

  data: Array<Survey>;

  @Input() dataSource: MatTableDataSource<Survey>;

  @Input() job?: Job;

  @Input() filterMode: 'LOCAL' | 'NETWORK';

  @Input() pageSize: number;

  @ViewChild('input', { static: true }) input: ElementRef;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  @Output() onDelete: EventEmitter<Array<Survey>> = new EventEmitter();

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private store: Store<fromApp.State>,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      filter: [''],
    });
  }

  ngAfterViewInit() {
    this.data = this.dataSource.data;
    console.log("~~~~~~~~~~~~", this.data)
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    /**
     * Uses rxjs to delay and cancel requests made to the backend
     * when filtering on surveys.
     *
     * https://www.freakyjolly.com/angular-rxjs-debounce-time-optimize-search-for-server-response/
     */
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter((res) => res.length >= 0),
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }

        if (this.filterMode === 'NETWORK') {
          this.store.dispatch(
            SurveyActions.fetchSurveys({
              start: 0,
              limit: this.pageSize,
              filter: text,
            })
          );
        }

        if (this.filterMode === 'LOCAL') {
          this.dataSource.data = this.data.filter((survey) => {
            return (
              (typeof survey.name === 'string' &&
                survey.name.toLowerCase().indexOf(text) === 0) ||
              (typeof survey.reference === 'string' &&
                survey.reference.toLowerCase().indexOf(text) === 0) ||
              (typeof survey.id === 'number' && survey.id.toString() === text)
            );
          });
        }
      });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  calendar(): void {
    const surveys = this.selection.isEmpty()
      ? this.dataSource.data
      : this.selection.selected;

    const surveyIds = surveys.map((survey) => survey.id);

    // Add the array of values to the query parameter as a JSON string
    const queryParams = {
      surveys: JSON.stringify(surveyIds),
    };

    // Create our 'NaviationExtras' object which is expected by the Angular Router
    const navigationExtras: NavigationExtras = {
      queryParams,
    };

    this.router.navigate([`/home/events/create`], navigationExtras);
  }

  drive(): void {
    const surveys = this.selection.isEmpty()
      ? this.dataSource.data
      : this.selection.selected;

    // Open modal
    const dialogRef = this.dialog.open(NavigationModalComponent, {
      data: {
        surveys,
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }

  delete(): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      data: {
        length: this.selection.selected.length,
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.onDelete.emit(this.selection.selected);
      this.selection.clear();
    });
  }

  addSurvey(): void {
    if (this.job) {
      const queryParams = {
        job: this.job.id,
      };

      // Create our 'NaviationExtras' object which is expected by the Angular Router
      const navigationExtras: NavigationExtras = {
        queryParams,
      };

      this.router.navigate([`/home/surveys/create`], navigationExtras);
    } else {
      this.router.navigate(['home/surveys/create']);
    }
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
    const surveys = this.selection.isEmpty()
      ? this.dataSource.data
      : this.selection.selected;

    const body = surveys.map((survey) => {
      return [
        survey.reference ? survey.reference : '',
        survey.name ? survey.name : '',
        survey.date_assigned ? moment(survey.date_assigned).format('L LT') : '',
        survey.date_delivery ? moment(survey.date_delivery).format('L LT') : '',
        survey.status.name ? survey.status.name : '',
        survey.job.reference ? survey.job.reference : '',
        survey.prepared_by && survey.prepared_by.username
          ? survey.prepared_by.username
          : '',
      ];
    });

    const fields = [
      'ID Reference',
      'Name',
      'Date Assigned',
      'Delivery Date',
      'Status',
      'Job',
      'Prepared By',
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

  onPageEvent(event?: PageEvent) {
    this.store.dispatch(
      SurveyActions.fetchSurveys({
        start: event.pageIndex * event.pageSize,
        limit: event.pageSize,
      })
    );
    return event;
  }

  details(id): void {
    if (this.job) {
      const queryParams = {
        job: this.job.id,
      };

      // Create our 'NaviationExtras' object which is expected by the Angular Router
      const navigationExtras: NavigationExtras = {
        queryParams,
      };

      this.router.navigate([`/home/surveys/${id}`], navigationExtras);
    } else {
      this.router.navigate([`home/surveys/${id}`]);
    }
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
  checkboxLabel(row?: Survey): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  isManager() {
    return this.authService.authValue.user.role.name === Roles.MANAGER
  }
}
