import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

import { Survey } from '../../models';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { MapsAPILoader } from '@agm/core';

import { ThemePalette } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import qs from 'qs';
import { Observable } from 'rxjs';
import { AuthService } from '../../services';
import { GeoJson } from '../../models';
import { MatStepper } from '@angular/material/stepper';

export interface DialogData {
  surveys: Array<Survey>;
  selected: Survey;
  geometry: any;
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

  home: GeoJson;

  otherAddress: GeoJson = null;

  work: GeoJson;

  position: GeolocationPosition;

  url: string;

  selectedDestinationType = 'only_selection';
  destinationTypes: Array<string> = ['survey', 'home', 'work', 'other_address', 'only_selection'];

  searchCtrl = new FormControl();
  surveys: Array<Survey>;
  geometry: any;
  selectedSurveyId = 0;
  selectedSurvey: Survey = null;

  @ViewChild('surveyInput', { static: true }) surveyInput: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<NavigationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private authService: AuthService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.getPosition().subscribe((position) => {
      this.position = position;
    });
  }

  ngAfterViewInit() {
    this.surveys = [...this.data.surveys];
    this.geometry = this.data.geometry;
    if (this.surveys.length > 0) {
      this.selectedSurvey = this.surveys[0];
      this.selectedSurveyId = this.selectedSurvey.id;
    }

    this.initMap();

    this.searchCtrl.valueChanges.subscribe(() => {
      this.mapsAPILoader.load().then(() => {
        const autocomplete = new google.maps.places.Autocomplete(
          this.searchInput.nativeElement
        );
        autocomplete.addListener('place_changed', () => {
          this.ngZone.run(() => {
            //get the place result
            const place: google.maps.places.PlaceResult = autocomplete.getPlace();

            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }

            this.otherAddress = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
          });
        });
      });
    });
  }

  /**
   * Initialises the mapbox map
   */
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
    this.getMapUrl();
    window.open(this.url);
    this.dialogRef.close(true);
  }

  onBack(stepper: MatStepper): void {
    stepper.previous();
  }

  onNext(stepper: MatStepper): void {
    stepper.next();
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
        if (this.surveys.length === 1) {
          this.selectedSurvey = this.surveys[0];
        }
        break;

      case 'home':
        // Set the users home address coordinates.
        this.home = this.authService.authValue.user.home;
        break;

      case 'work':
        // Set the users work address coordinates.
        this.work = this.authService.authValue.user.work;
        break;
    }
  }

  /**
   * Sets whether step 2 is considered as completed.
   * @returns
   */
  isStep2Completed(): boolean {
    switch (this.selectedDestinationType) {
      case 'survey':
        return this.selectedSurvey !== null;
      case 'home':
        return this.home !== null;
      case 'work':
        return this.work !== null;
      case 'other_address':
        return this.otherAddress !== null;
      case 'only_selection':
        return this.geometry !== null;
      default:
        return true;
    }
  }

  private getMapUrl() {
    this.directions.setOrigin([
      this.position.coords.longitude,
      this.position.coords.latitude,
    ]);

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
          const otherSurveys = this.data.surveys.filter(
            (survey) => survey.id !== this.selectedSurvey.id
          );
          // Filter out selected survey from other surveys assigning as waypoints

          // Generate waypoints
          waypoints = this.generateWaypoints(otherSurveys);
        }

        this.directions.setDestination([
          Number(this.selectedSurvey.geometry.lng),
          Number(this.selectedSurvey.geometry.lat),
        ]);

        break;

      /**
       * Home is the destination, and all the selected surveys
       * are waypoints.
       */
      case 'home':
        // pull the user home address
        destination = `${Number(this.home?.lat)},${Number(this.home?.lng)}`;

        waypoints = this.generateWaypoints(this.data.surveys);

        this.directions.setDestination([
          Number(this.home?.lng),
          Number(this.home?.lat),
        ]);

        break;

      /**
       * work is the destination, and all the selected surveys
       * are waypoints.
       */
      case 'work':
        // pull the user work address
        destination = `${Number(this.work?.lat)},${Number(this.work?.lng)}`;

        waypoints = this.generateWaypoints(this.data.surveys);

        this.directions.setDestination([
          Number(this.work?.lng),
          Number(this.work?.lat),
        ]);

        // First need to add as field on the user
        break;

      /**
       * Other address is the destination, and all the selected surveys
       * are waypoints.
       */
      case 'other_address':
        // Do something esle
        destination = `${Number(this.otherAddress.lat)},${Number(this.otherAddress.lng)}`;
        waypoints = this.generateWaypoints(this.data.surveys);

        this.directions.setDestination([
          Number(this.otherAddress.lng),
          Number(this.otherAddress.lat),
        ]);
        break;

      /**
       * Other address is the destination, and all the selected surveys
       * are waypoints.
       */
      case 'only_selection':
        // Do something esle
        destination = `${Number(this.geometry.lat)},${Number(this.geometry.lng)}`;
        waypoints = this.generateWaypoints(this.data.surveys);

        this.directions.setDestination([
          Number(this.geometry.lng),
          Number(this.geometry.lat),
        ]);
        break;
    }

    const queryString = qs.stringify({
      waypoints,
      destination,
    });

    // Construct the url
    this.url = `${environment.google.maps.url}${queryString}`;
    return this.url;
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

  getPosition(): Observable<any> {
    return Observable.create((observer) => {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next(position);
          observer.complete();
        },
        (error) => observer.error(error)
      );
    });
  }

  onChangeSelectedSurvey() {
    this.selectedSurvey = this.surveys.find(it => it.id == this.selectedSurveyId);
  }
}
