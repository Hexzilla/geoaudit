import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

import { Survey } from '../../models';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store';
import { ThemePalette } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { fromEvent, Observable } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged, startWith, tap } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

export interface DialogData {
  surveys: Array<Survey>;
}

@Component({
  selector: 'geoaudit-navigation-modal',
  templateUrl: './navigation-modal.component.html',
  styleUrls: ['./navigation-modal.component.scss']
})
export class NavigationModalComponent implements OnInit, AfterViewInit {

  color: ThemePalette = 'primary';

  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = environment.coordinates.lat;
  lng = environment.coordinates.lng;

  directions = new MapboxDirections({
    accessToken: environment.mapbox.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving'
  });

  url: string;

  selectedDestinationType: string;
  destinationTypes: Array<string> = [
    'survey',
    'home',
    'work',
    'other_address'
  ];

  surveyCtrl = new FormControl();
  filteredSurveys: Array<Survey>;

  selectedSurvey: Survey;

  @ViewChild('input', { static: true }) input: ElementRef;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    public dialogRef: MatDialogRef<NavigationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private route: ActivatedRoute,
    private store: Store<fromApp.State>
  ) { }

  ngOnInit(): void {
    // this.initMap();

    console.log(this.data.surveys)

    this.initDirections(this.data.surveys)
  }

  ngAfterViewInit() {

      // this.filteredSurveys = this.surveyCtrl.valueChanges
      // .pipe(
      //   startWith(''),
        // map(state => state ? this._filterSurveys(state) : this.data.surveys.slice())
      // );

      this.surveyCtrl.valueChanges.subscribe(value => {
        console.log('_filterSurveys', value)

        if (value) {
          this.filteredSurveys = this._filterSurveys(value);
        } else {
          this.filteredSurveys = this.data.surveys.slice();
        }

        // this.filteredSurveys = map(value => value ? this._filterSurveys(state) : this.data.surveys.slice())
      })
  }

  initMap(): void {
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: 'mapbox',
      style: this.style,
      zoom: 13,
      center: [this.lng, this.lat],
    });

    // Add map controls
    this.map.addControl(new mapboxgl.FullscreenControl());
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(this.directions, 'top-left');
  }

  initDirections(surveys: Array<Survey>): void {
    this.directions.setOrigin([
      0.020390, 52.130989
    ]);

    let index = 0;

    let destination = ''
    let waypoints;

    surveys.map(survey => {
      if (surveys[index++]) {
        // this.directions.addWaypoint(index, [Number(survey.geometry.lng), Number(survey.geometry.lat)]);

        if (waypoints) {
          waypoints = `${waypoints}|${Number(survey.geometry.lat)},${Number(survey.geometry.lng)}`
        } else {
          waypoints = `${Number(survey.geometry.lat)},${Number(survey.geometry.lng)}`
        }
        index++;
      } else {
        console.log('just the one')
        // this.directions.setDestination([Number(survey.geometry.lng), Number(survey.geometry.lat)])
        destination = `${Number(survey.geometry.lat)},${Number(survey.geometry.lng)}`
      }
    });

    console.log(destination, waypoints)

    this.url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&waypoints=${waypoints}`;
    console.log('url', this.url)

  }

  onNoClick(): void {
    this.dialogRef.close();

    console.log('selectedSurvey', this.selectedSurvey)
  }

  onYesClick(): void {
    window.open(this.url);

    this.dialogRef.close(true);
  }

  isSubmitDisabled(): boolean {
    return !this.selectedDestinationType;
  }

  onDestinationTypeClick(destinationType: string): void {
    console.log('onDestinationTypeClick', destinationType)

    // If home load home data

    // If work load work data

    // If other address prepare services for searching
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.surveyCtrl.setValue(event.option.value.id_reference);
    this.selectedSurvey = event.option.value;
  }

  private _filterSurveys(value: string): Array<Survey> {
    if (value && typeof value === "string") {
      const filterValue = value.toLowerCase();  
      return this.data.surveys.filter(survey => survey.name.toLowerCase().indexOf(filterValue) === 0);
    }
  }
}
