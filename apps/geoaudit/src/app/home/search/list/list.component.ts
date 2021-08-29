import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AbrioxEntityService } from '../../../entity-services/abriox-entity.service';
import { ResistivityEntityService } from '../../../entity-services/resistivity-entity.service';
import { SiteEntityService } from '../../../entity-services/site-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { TrEntityService } from '../../../entity-services/tr-entity.service';
import { Survey, Tr, Resistivity, Site, Testpost, Abriox } from '../../../models';
import qs from 'qs';

// Store
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
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);

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

  public selectedCategory = "List";
  public formdata ;

  constructor(
    // public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private abrioxEntityService: AbrioxEntityService,
    private testpostEntityService: TestpostEntityService,
    private trEntityService: TrEntityService,
    private resistivityEntityService: ResistivityEntityService,
    private surveyEntityService: SurveyEntityService,
    private siteEntityService: SiteEntityService,
    private selectionService: SelectionService,
  ) {
    
    this.formdata = this.router.getCurrentNavigation().extras.state.condition;
    console.log("extra data is ",this.formdata.name);
    this.selectedCategory = this.formdata.category;
      
  }

  ngOnInit(): void {
    const parameters = qs.stringify({
      // Here insert code search condition
      // _where: {
      //   'name': this.formdata.name,
      //   'reference': this.formdata.reference,
      //   'address': this.formdata.address,
      // },
      _sort: 'created_at:DESC',
    });
    
    if(this.selectedCategory === "surveys"){
      this.surveyEntityService.getWithQuery(parameters).subscribe(surveys => {
        this.dataSource = new MatTableDataSource(surveys);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<Survey>(true, []);
      })
    }
    if(this.selectedCategory === "Ttestpost"){
      this.testpostEntityService.getWithQuery(parameters).subscribe(posts => {
        this.dataSource = new MatTableDataSource(posts);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<Testpost>(true, []);
      })
    }
    if(this.selectedCategory === "tr"){
      this.trEntityService.getWithQuery(parameters).subscribe(trs => {
        this.dataSource = new MatTableDataSource(trs);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<Tr>(true, []);
      })
    }
    if(this.selectedCategory === "site"){
      this.siteEntityService.getWithQuery(parameters).subscribe(sites => {
        this.dataSource = new MatTableDataSource(sites);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<Site>(true, []);
      })
    }
    if(this.selectedCategory === "abriox"){
      this.abrioxEntityService.getWithQuery(parameters).subscribe(abriox => {
        this.dataSource = new MatTableDataSource(abriox);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<Abriox>(true, []);
      })
    }
    if(this.selectedCategory === "resistivity"){
      this.resistivityEntityService.getWithQuery(parameters).subscribe(resistivity => {
        this.dataSource = new MatTableDataSource(resistivity);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<Resistivity>(true, []);
      })
    }
    
    this.selectionService.setSurveyMarkerFilter.emit([]);
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void{
    this.selectionService.setSurveyMarkerFilter.emit(null);
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
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  onCheckedRow(event, selections) {
    this.isShowSelectBtn();
    if(this.selectedCategory === "surveys"){
      const surveys = selections.selected;
      this.selectionService.setSurveyMarkerFilter.emit(surveys);
    }
  }

  isShowSelectBtn(){
    const numSelected = this.selection.selected.length;
    return numSelected === 1;
  }

  details(id) {
    this.router.navigate([`/home/${this.selectedCategory}/${id}`]);
  }

  selectItem(){
    // console.log(this.selection.selected[0].id);
    let id = this.selection.selected[0].id;
    this.router.navigate([`/home/${this.selectedCategory}/${id}`]);
  }
}

