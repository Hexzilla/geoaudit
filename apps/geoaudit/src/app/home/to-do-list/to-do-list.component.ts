import { SelectionModel } from '@angular/cdk/collections';
import { ElementRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
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
export class ToDoListComponent implements OnInit {
  dataSource: MatTableDataSource<Survey>;

  // MatPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<fromApp.State>,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.store.dispatch(
      SurveyActions.countSurveys()
    );
    
    this.store.dispatch(
      SurveyActions.fetchSurveys({ start: 0, limit: this.pageSize })
    );

    this.store.select('survey').subscribe((state) => {
      this.length = state.count;
      this.dataSource = new MatTableDataSource(state.surveys);
    });
  }

  delete(surveys: Array<Survey>): void {
    this.store.dispatch(
      SurveyActions.deleteSurveys({ surveys })
    );
  }
}
