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
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import qs from 'qs';

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
    console.log(this.data.surveys);
  }

  ngAfterViewInit() {
    this.initMap();

    /**
     * For when survey is selected, we use this to catch the text input
     * and then filter the surveys against the given input.
     */
    this.surveyCtrl.valueChanges.subscribe((value) => {
      if (value) {
        this.filteredSurveys = this._filterSurveys(value);
      } else {
        this.filteredSurveys = this.data.surveys.slice();
      }
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

  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Open the url for which should be Google Maps with destination and waypoints.
   */
  onYesClick(): void {
    window.open(this.url);
    this.dialogRef.close(true);
  }

  /**
   * Only on step 3.
   * @returns 
   */
  isSubmitDisabled(): boolean {
    return !this.url;
  }

  /**
   * Handle on click of a destination type in step 1 i.e. survey, home, work, other address.
   * If survey for example, if there is only survey then we set the step 2 input saving the user from
   * having to input it ... and there isn't any other surveys.
   * @param destinationType 
   */
  onDestinationTypeClick(destinationType: string): void {
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
          this.selectedSurvey = this.data.surveys[0];
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

  /**
   * On step option selected i.e. when a user
   * inputs text to filter a survey and then selects one.
   * 
   * We set the input value and set as the selected survey.
   * @param event 
   */
  selected(event: MatAutocompleteSelectedEvent): void {
    this.surveyCtrl.setValue(event.option.value.id_reference);
    this.selectedSurvey = event.option.value;
  }

  /**
   * Sets whether step 2 is considered as completed.
   * @returns 
   */
  isStep2Completed(): boolean {
    switch (this.selectedDestinationType) {
      case 'survey':
        return this.selectedSurvey !== null;
        break;
      default:
        return false;
    }
  }

  /**
   * On step selection change i.e. user clicks on a given step.
   * Catch the change and if it is for step three then prepare
   * for navigation.
   * @param event 
   */
  selectionChange(event: StepperSelectionEvent) {
    switch (event.selectedStep.label) {
      case 'Step 1':
        // Nothing
        break;

      case 'Step 2':
        // Nothing
        break;

      case 'Step 3':
        this.directions.setOrigin([0.02039, 52.130989]);

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

        this.directions.setDestination([
          Number(this.selectedSurvey.geometry.lng),
          Number(this.selectedSurvey.geometry.lat),
        ]);

        const queryString = qs.stringify({
          waypoints,
          destination,
        });

        // Construct the url
        this.url = `${environment.google.maps.url}${queryString}`;
        break;
    }
  }

  /**
   * Generate waypoints based on surveys.
   * Will take an array of surveys excluding the destination
   * and map through them constructing the waypoints and then returning them.
   * @param otherSurveys 
   * @returns 
   */
  generateWaypoints(otherSurveys: Array<Survey>): string {
    let waypoints;
    let index = 0;

    otherSurveys.map((otherSurvey) => {
      if (otherSurveys.length >= 2) {
        if (waypoints) {
          waypoints = `${waypoints}${Number(otherSurvey.geometry.lat)},${Number(
            otherSurvey.geometry.lng
          )}`;
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

      this.directions.addWaypoint(index, [
        Number(otherSurvey.geometry.lng),
        Number(otherSurvey.geometry.lat),
      ]);
    });

    return waypoints;
  }

  /**
   * For filtering the surveys based on a string input value
   * @param value 
   * @returns 
   */
  private _filterSurveys(value: string): Array<Survey> {
    if (value && typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.data.surveys.filter(
        (survey) => survey.name.toLowerCase().indexOf(filterValue) === 0 || survey.id.toString().indexOf(filterValue) === 0
      );
    }
  }
}
