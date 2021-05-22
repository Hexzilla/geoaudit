import { SelectionModel } from '@angular/cdk/collections';
import { ElementRef } from '@angular/core';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { fromEvent } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs/operators';
import * as moment from 'moment';

import Papa from 'papaparse';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { DeleteModalComponent } from '../../modals/delete-modal/delete-modal.component';
import { Survey } from '../../models';

import * as fromApp from '../../store';
import * as SurveyActions from '../../store/survey/survey.actions';
import { NavigationExtras, Router } from '@angular/router';
import { NavigationModalComponent } from '../../modals/navigation-modal/navigation-modal.component';

@Component({
  selector: 'geoaudit-to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss'],
})
export class ToDoListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'name', 'date_delivery', 'status'];
  dataSource: MatTableDataSource<Survey>;
  selection = new SelectionModel<Survey>(true, []);

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
    private formBuilder: FormBuilder,
    private store: Store<fromApp.State>,
    public dialog: MatDialog,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      filter: [''],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.store.dispatch(
      SurveyActions.countSurveys({ start: 0, limit: this.pageSize })
    );
    this.store.dispatch(
      SurveyActions.fetchSurveys({ start: 0, limit: this.pageSize })
    );

    this.store.select('survey').subscribe((state) => {
      this.length = state.count;
      this.dataSource = new MatTableDataSource(state.surveys);
    });
  }

  ngAfterViewInit() {
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

        this.store.dispatch(
          SurveyActions.fetchSurveys({
            start: 0,
            limit: this.pageSize,
            filter: text,
          })
        );
      });
  }

  calendar(): void {
    const surveys = this.selection.isEmpty()
    ? this.dataSource.data
    : this.selection.selected;

    const surveyIds = surveys.map(survey => survey.id);    
    console.log('surveyIds', surveyIds)

    // Add the array of values to the query parameter as a JSON string
    const queryParams = {
      surveys: JSON.stringify(surveyIds)
    }

    console.log(queryParams)
    
    // Create our 'NaviationExtras' object which is expected by the Angular Router
    const navigationExtras: NavigationExtras = {
      queryParams
    };

    console.log(navigationExtras)

    this.router.navigate([`/home/calendar/event`], navigationExtras);
  }

  drive(): void {
    const surveys = this.selection.isEmpty()
    ? this.dataSource.data
    : this.selection.selected;

    // Open modal
    const dialogRef = this.dialog.open(NavigationModalComponent, {
      data: {
        surveys
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {}       
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
      if (result)
        this.store.dispatch(
          SurveyActions.deleteSurveys({ surveys: this.selection.selected })
        );
    });
  }

  addSurvey(): void {
    console.log('add survey')

    this.router.navigate([`/home/survey`]);
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
        survey.id_reference,
        survey.name,
        moment(survey.date_assigned).format('L LT'),
        moment(survey.date_delivery).format('L LT'),
        survey.status.name,
        survey.job.job_reference,
        survey.prepared_by.username,
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
      head: [
        fields
      ],
      body,
    });

    doc.save(`${moment().toISOString(true)}-survey-download.pdf`);

    const csv = Papa.unparse({
      data: body,
      fields
    });
    const blob = new Blob([csv]);

    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = `${moment().toISOString(true)}-survey-download.csv`;
    document.body.appendChild(a);
    a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
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
  checkboxLabel(row?: Survey): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }
}
