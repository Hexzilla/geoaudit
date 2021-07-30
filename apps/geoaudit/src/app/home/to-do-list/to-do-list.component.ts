import { SelectionModel } from '@angular/cdk/collections';
import { ElementRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { fromEvent, Observable } from 'rxjs';
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
import { SurveyEntityService } from '../../entity-services/survey-entity.service';
import { ToDoListEntityService } from '../../entity-services/to-do-list-entity.service';

@Component({
  selector: 'geoaudit-to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss'],
})
export class ToDoListComponent implements OnInit {
  dataSource: MatTableDataSource<Survey>;

  // MatPaginator Inputs
  pageSize = 5;

  surveys$: Observable<Array<Survey>>;

  constructor(
    private store: Store<fromApp.State>,
    public dialog: MatDialog,
    private toDoListEntityService: ToDoListEntityService
  ) {}

  ngOnInit(): void {
    this.surveys$ = this.toDoListEntityService.getAll();

    this.surveys$.subscribe(surveys => {
        this.dataSource = new MatTableDataSource(surveys);
    })
  }

  delete(surveys: Array<Survey>): void {
    this.store.dispatch(
      SurveyActions.deleteSurveys({ surveys })
    );
  }
}
