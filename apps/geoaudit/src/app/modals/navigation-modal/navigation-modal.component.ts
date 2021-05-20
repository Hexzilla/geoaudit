import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

import { Survey } from '../../models';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store';
import { ThemePalette } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { fromEvent, Observable } from 'rxjs';
import {
  map,
  filter,
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
} from 'rxjs/operators';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

export interface DialogData {
  surveys: Array<Survey>;
}

@Component({
  selector: 'geoaudit-navigation-modal',
  templateUrl: './navigation-modal.component.html',
  styleUrls: ['./navigation-modal.component.scss'],
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
    profile: 'mapbox/driving',
  });

  url: string;

  selectedDestinationType: string;
  destinationTypes: Array<string> = ['survey', 'home', 'work', 'other_address'];

  surveyCtrl = new FormControl();
  filteredSurveys: Array<Survey>;

  selectedSurvey: Survey = null;

  @ViewChild('surveyInput', { static: true }) surveyInput: ElementRef;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    public dialogRef: MatDialogRef<NavigationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private route: ActivatedRoute,
    private store: Store<fromApp.State>
  ) {}

  ngOnInit(): void {
    // this.initMap();

    console.log(this.data.surveys);

    this.initDirections(this.data.surveys);
  }

  ngAfterViewInit() {
    // this.filteredSurveys = this.surveyCtrl.valueChanges
    // .pipe(
    //   startWith(''),
    // map(state => state ? this._filterSurveys(state) : this.data.surveys.slice())
    // );

    this.surveyCtrl.valueChanges.subscribe((value) => {
      console.log('_filterSurveys', value);

      if (value) {
        this.filteredSurveys = this._filterSurveys(value);
      } else {
        this.filteredSurveys = this.data.surveys.slice();
      }

      // this.filteredSurveys = map(value => value ? this._filterSurveys(state) : this.data.surveys.slice())
    });
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
    this.directions.setOrigin([0.02039, 52.130989]);

    let index = 0;

    let destination = '';
    let waypoints;

    surveys.map((survey) => {
      if (surveys[index++]) {
        // this.directions.addWaypoint(index, [Number(survey.geometry.lng), Number(survey.geometry.lat)]);

        if (waypoints) {
          waypoints = `${waypoints}|${Number(survey.geometry.lat)},${Number(
            survey.geometry.lng
          )}`;
        } else {
          waypoints = `${Number(survey.geometry.lat)},${Number(
            survey.geometry.lng
          )}`;
        }
        index++;
      } else {
        console.log('just the one');
        // this.directions.setDestination([Number(survey.geometry.lng), Number(survey.geometry.lat)])
        destination = `${Number(survey.geometry.lat)},${Number(
          survey.geometry.lng
        )}`;
      }
    });

    console.log(destination, waypoints);

    this.url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&waypoints=${waypoints}`;
    console.log('url', this.url);
  }

  onNoClick(): void {
    this.dialogRef.close();

    console.log('selectedSurvey', this.selectedSurvey);
  }

  onYesClick(): void {
    window.open(this.url);

    this.dialogRef.close(true);
  }

  isSubmitDisabled(): boolean {
    return !this.selectedDestinationType;
  }

  onDestinationTypeClick(destinationType: string): void {
    console.log('onDestinationTypeClick', destinationType);

    switch (destinationType) {
      case 'survey':
        /**
         * If they click survey as the destination type
         * and there is only one survey then we can assume
         * that that is the survey they wish to be
         * their destination.
         */
        if (this.data.surveys.length === 1) {
          this.surveyCtrl.setValue(this.data.surveys[0].id_reference);
          this.selectedSurvey = this.data.surveys[0]
        }
        break;

      case 'home':
        // pull the user home address
        break;

      case 'work':
        // pull the user work address
        break;

      case 'other_address':
        // Do something esle
        break;
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.surveyCtrl.setValue(event.option.value.id_reference);
    this.selectedSurvey = event.option.value;
    console.log('selected');
  }

  isStep2Completed(): boolean {
    switch (this.selectedDestinationType) {
      case 'survey':
        return this.selectedSurvey !== null;
        break;
      default:
        return false;
    }
  }

  selectionChange(event: StepperSelectionEvent) {
    console.log(event.selectedStep.label);
    let stepLabel = event.selectedStep.label;
    if (stepLabel == 'Step 2') {
      console.log('CLICKED STEP 2');
    }

    switch (stepLabel) {
      case 'Step 1':
        console.log('at step 1');

        // Nothing

        break;

      case 'Step 2':
        console.log('at step 2');

        // Nothing

        break;

      case 'Step 3':
        console.log('at step 3');

        // Compute navigation
        let destination;
        let waypoints;

        switch (this.selectedDestinationType) {
          /**
           * For surveys, we want to know firstly
           * how many surveys have been selected such that we know
           * whether we're working with just a destination
           * or additionally waypoints.
           *
           * In the last step, we would have selected the survey or
           * it would have been automatically selected if there was only
           * one survey.
           *
           * If there is one survey then take the survey and
           * assign it as the destination.
           *
           * If there are multiple surveys, get the selected destination
           * survey and filter it out from the other selected surveys
           * of which will be waypoints.
           */
          case 'survey':
            // destination=${destination}&waypoints=${waypoints}

            // Get selected survey and assign as destination
            destination = `${Number(this.selectedSurvey.geometry.lat)},${Number(
              this.selectedSurvey.geometry.lng
            )}`;

            if (this.data.surveys.length >= 2) {
              let otherSurveys = this.data.surveys.filter(
                (survey) => survey.id !== this.selectedSurvey.id
              );
              // Filter out selected survey from other surveys assigning as waypoints

              // Generate waypoints
              waypoints = this.generateWaypoints(otherSurveys);
            }

            break;

          /**
           * Home is the destination, and all the selected surveys
           * are waypoints.
           */
          case 'home':
            // pull the user home address

            // First need to add as field on the user 
            break;

          /**
           * work is the destination, and all the selected surveys
           * are waypoints.
           */
          case 'work':
            // pull the user work address

            // First need to add as field on the user 
            break;

          /**
           * Other address is the destination, and all the selected surveys
           * are waypoints.
           */
          case 'other_address':
            // Do something esle
            break;
        }

        console.log('destination', destination);
        console.log('waypoints', waypoints);

        break;
    }
  }

  generateWaypoints(otherSurveys: Array<Survey>): string {
    let waypoints;
    let index = 0;

    otherSurveys.map((otherSurvey) => {
      if (otherSurveys.length >= 2) {
        if (waypoints) {
          waypoints = `${waypoints}${Number(
            otherSurvey.geometry.lat
          )},${Number(otherSurvey.geometry.lng)}`;
        } else {
          waypoints = `${Number(otherSurvey.geometry.lat)},${Number(
            otherSurvey.geometry.lng
          )}`;
        }

        if (otherSurveys[index++]) {
          waypoints = `${waypoints}|`;
          index++;
        }
      } else {
        waypoints = `${Number(otherSurvey.geometry.lat)},${Number(
          otherSurvey.geometry.lng
        )}`;
      }
    });

    return waypoints;
  }

  private _filterSurveys(value: string): Array<Survey> {
    if (value && typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.data.surveys.filter(
        (survey) => survey.name.toLowerCase().indexOf(filterValue) === 0
      );
    }
  }
}
