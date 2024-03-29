import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import {
  Survey,
  Tr,
  Resistivity,
  Site,
  Testpost,
  Abriox,
} from '../../../models';
import qs from 'qs';

// Store
import { SelectionService } from '../../../services/selection.service';
@Component({
  selector: 'geoaudit-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
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

  public selectedCategory = 'List';
  public formdata: any = {};

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
    private selectionService: SelectionService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.formdata = this.router.getCurrentNavigation().extras.state.condition;
      console.log('extra data is ', this.formdata.name);
      this.selectedCategory = this.formdata.category;
    }
  }

  ngOnInit(): void {
    let where: any = {};
    
    if (this.formdata.name) {
      where = {
        ...where,
        name_contains: this.formdata.name,
      };
    }
    if (this.formdata.reference) {
      where = {
        ...where,
        reference_contains: this.formdata.reference,
      };
    }
    if (this.formdata.address) {
      where = {
        ...where,
        address_contains: this.formdata.address,
      };
    }
    /*if (this.formdata.latCtrl && this.formdata.lngCtrl) {
      where = {
        ...where,
        'geometry_contains': { "lng": this.formdata.lngCtrl, "lat": this.formdata.latCtrl }
      };
    }*/
    const parameters = qs.stringify({
      _where: where,
      _sort: 'created_at:DESC',
    });

    const entityService: any = this.getEntityService(this.selectedCategory);
    entityService?.getWithQuery(parameters).subscribe((res) => {
      if (this.formdata.nearLocation) {
        this.nearLocationSort(res);
      } 
      else if (this.formdata.latCtrl && this.formdata.lngCtrl) {
        const coords = {
          latitude: this.formdata.latCtrl,
          longitude: this.formdata.lngCtrl,
        }
        this.sortByLocation(res, coords);
      }
      else {
        if(this.formdata.lngCtrl && this.formdata.latCtrl)
        {
          this.selectionService.setLocation.emit({geometry:{lat:this.formdata.latCtrl, lng:this.formdata.lngCtrl}});
        }
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<Survey>(true, []);
      }
    });
    this.selectionService.setSurveyMarkerFilter.emit([]);
  }
  
  nearLocationSort(res) {
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('mylocation', position.coords);
        this.sortByLocation(res, position.coords);
      },
      (error) => {
        console.log(error);
      }
    );
  }
  
  sortByLocation(res, coords) {
    console.log('sortByLocation', coords);
    this.selectionService.setLocation.emit({geometry:{lat: coords.latitude, lng: coords.longitude}});
    res.sort((a, b): number => {
      return (
        this.haversine_distance(a, coords) - this.haversine_distance(b, coords)
      );
    });
    this.dataSource = new MatTableDataSource(res);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.selection = new SelectionModel<Survey>(true, []);
  }

  getEntityService(category) {
    switch (category) {
      case 'surveys':
        return this.surveyEntityService;
      case 'testpost':
        return this.testpostEntityService;
      case 'tr':
        return this.trEntityService;
      case 'site':
        return this.siteEntityService;
      case 'abriox':
        return this.abrioxEntityService;
      case 'resistivity':
        return this.resistivityEntityService;
    }
    return null;
  }
  
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void {
    this.selectionService.setSurveyMarkerFilter.emit(null);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.data.length;
    return numSelected === numRows;
  }

  haversine_distance(mkPositioin, coords) {
    if (!mkPositioin.geometry) return;
    const R = 3958.8; // Radius of the Earth in miles
    const rlat1 = mkPositioin.geometry.lat * (Math.PI / 180); // Convert degrees to radians
    const rlat2 = coords.latitude * (Math.PI / 180); // Convert degrees to radians
    const difflat = rlat2 - rlat1; // Radian difference (latitudes)
    const difflon =
      (coords.longitude - mkPositioin.geometry.lng) *
      (Math.PI / 180); // Radian difference (longitudes)

      const d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(difflat / 2) * Math.sin(difflat / 2) +
            Math.cos(rlat1) *
              Math.cos(rlat2) *
              Math.sin(difflon / 2) *
              Math.sin(difflon / 2)
        )
      );
    return d;
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
    console.log(selections.selected);
    this.isShowSelectBtn();
    if (this.selectedCategory === 'surveys') {
      const surveys = selections.selected;
      this.selectionService.setSurveyMarkerFilter.emit(surveys);
    }
  }

  isShowSelectBtn() {
    const numSelected = this.selection.selected.length;
    return numSelected === 1;
  }

  details(id) {
    this.router.navigate([`/home/${this.selectedCategory}/${id}`]);
  }

  selectItem() {
    // console.log(this.selection.selected[0].id);
    let id = this.selection.selected[0].id;
    this.router.navigate([`/home/${this.selectedCategory}/${id}`]);
  }
}
