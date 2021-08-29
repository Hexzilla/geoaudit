import { Component, NgModule, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators
} from '@angular/forms';
import { CATEGORIES } from './mockCategories';
import { Categories } from './categories';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store';
import * as MapActions from '../../store/map/map.actions';
import { AlertService } from '../../services';

@Component({
  selector: 'geoaudit-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent implements OnInit {

  form:  FormGroup;

  categories = CATEGORIES;
  selectedCategory?: Categories;

  @ViewChild('latCtrlInput') latCtrlInput: ElementRef;
  @ViewChild('lngCtrlInput') lngCtrlInput: ElementRef;

  latCtrl = new FormControl();

  lngCtrl = new FormControl();

  isSelectedCategory: boolean = false;

  constructor(
    private router: Router,
    private store: Store<fromApp.State>,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    ) { }

  ngOnInit(): void {

    this.store.select('map').subscribe((map) => {
      if (map.clickMarker) {
        this.latCtrl.setValue(map.clickMarker.lat);
        this.lngCtrl.setValue(map.clickMarker.lng);
      }
    });
    this.initialiseForm();
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
   initialiseForm(): void {
    this.form = this.formBuilder.group({
      category: [null, Validators.required],
      name: [null, Validators.required],
      reference:[null, Validators.required],
      address: null,
    });
  }

  onSelect(event=null): void {
    // this.selectedCategory = category;
    if(event != null) this.isSelectedCategory = true;
    console.log("selected= ", event);
  }

  toggleMyLocation(): void{

  }

  clickMarker(): void {
    this.store.dispatch(
      MapActions.toggleSidebar({
        url: this.router.url,
      })
    );
  }

  submit() {
    if (this.form.invalid) {
      this.alertService.error('Invalid');
      return;
    }
    console.log("form value = ", this.form.value);
    this.router.navigate([`/home/search/`+this.form.value]);
  }
}
