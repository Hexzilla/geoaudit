import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { Store } from '@ngrx/store';
import { Survey } from '../../models';

import * as fromApp from '../../store';
import * as SurveyActions from '../../store/survey/survey.actions';

@Component({
  selector: 'geoaudit-to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss']
})
export class ToDoListComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['name', 'date_delivery', 'status'];
  dataSource: MatTableDataSource<Survey>;

  form: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // MatPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<fromApp.State>
  ) {
    this.form = this.formBuilder.group({
      filter: ['']
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.store.dispatch(SurveyActions.countSurveys());
    this.store.dispatch(SurveyActions.fetchSurveys({ start: 0, limit: this.pageSize } ));

    this.store.select('survey').subscribe(state => {
      this.length = state.count;
      this.dataSource = new MatTableDataSource(state.surveys);
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  calendar(): void {
    
  }

  onPageEvent(event?: PageEvent) {
    this.store.dispatch(SurveyActions.fetchSurveys({ start: event.pageIndex * event.pageSize, limit: event.pageSize } ));
    return event;
  }
}