import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Job, Statuses } from '../../../models';

// Store
import { JobEntityService } from '../../../entity-services/job-entity.service';
import { SelectionService } from '../../../services/selection.service';
@Component({
  selector: 'geoaudit-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent implements  OnInit {
  displayedColumns: string[] = [
    'select',
    'reference',
    'name',
    'status',
    'actions',
  ];
  // dataSource: MatTableDataSource<Job>;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);

  

  filterCtrl = new FormControl();

  form: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // MatPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  // jobs$ = this.jobEntityService.entities$;

  constructor(
    // public dialog: MatDialog,
    private formBuilder: FormBuilder,
    // private router: Router,
    // private jobEntityService: JobEntityService,
    private selectionService: SelectionService,
  ) {
    this.form = this.formBuilder.group({
      filter: [''],
    });
  }

  ngOnInit(): void {
    
    // this.jobs$.subscribe(
    //   (jobs) => {
    //     this.length = jobs.length;
    //     this.dataSource = new MatTableDataSource(jobs);
    //     this.dataSource.paginator = this.paginator;
    //     this.dataSource.sort = this.sort;
    //   }
    // )

    this.selectionService.setSurveyMarkerFilter.emit([]);
  }

  

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void{
    this.selectionService.setSurveyMarkerFilter.emit(null);
  } 

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
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
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  onCheckedRow(event, selections) {
    // if (selections.selected.length == 0) {
    //   this.jobs$.subscribe(
    //     () => {
    //       this.selectionService.setSurveyMarkerFilter.emit([]);
    //     }
    //   )
    // }
    // else
    console.log("selections = ", selections);
     {
      const surveys = selections.selected.reduce((_surveys, job) => {
        return _surveys.concat(job.surveys)
      }, [])
      this.selectionService.setSurveyMarkerFilter.emit(surveys);
    }
  }
}


// example data
export interface PeriodicElement {
  name: string;
  id: number;
  reference: string;
  geometry: object;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {id: 58, reference: "bbbbbb", geometry:{lat: 52.361044214189064, lng: -3.6161022457960987}, name: "bbbbbbbb"},
  {id: 49, reference: "Survey07.08.21-1", geometry:{lat: 52.303848665888644, lng: 0.6534669842744912}, name: "Survey07.08.21-1"	},
  {id: 106, reference: "dddddd", geometry:{lat: 53.049920993735554, lng: -0.491921044852286}, name: "survey not started"},
  {id: 55, reference: "bbbb", geometry:{lat: 52.47272313288516, lng: -0.14388847132243}, name: "bbb"}
];
