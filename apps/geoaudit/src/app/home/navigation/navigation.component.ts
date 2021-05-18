import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import * as SurveyActions from '../../store/survey/survey.actions';
import * as SurveySelectors from '../../store/survey/survey.selectors';
import { Survey } from '../../models';
import * as fromApp from '../../store';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

import * as mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

import { environment } from 'apps/geoaudit/src/environments/environment';

@Component({
  selector: 'geoaudit-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  surveys: Array<Survey>;

  surveys$: Observable<Array<Survey>>;

  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = environment.coordinates.lat;
  lng = environment.coordinates.lng;

  directions = new MapboxDirections({
    accessToken: environment.mapbox.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving'
  });

  constructor(
    private route: ActivatedRoute,
    private store: Store<fromApp.State>
  ) {}

  ngOnInit(): void {
    this.initMap();

    /**
     * Parse survey ids as supplied in the address bar
     * as query parameter.
     */
    this.parseSurveyIds();

    this.surveys$.subscribe((surveys) => {
      this.initDirections(surveys);
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
    this.directions.setOrigin([
      0.020390, 52.130989
    ]);

    let index = 0;

    surveys.map(survey => {
      if (surveys[index++]) {
        this.directions.addWaypoint(index, [Number(survey.geometry.lng), Number(survey.geometry.lat)]);
        index++;
      } else {
        this.directions.setDestination([Number(survey.geometry.lng), Number(survey.geometry.lat)])
      }
    });
  }

  parseSurveyIds(): void {
    // Survey ids as query parameter.
    const surveyIds = this.route.snapshot.queryParamMap.get('surveys');

    // If the value is null, create a new array and store it
    // Else parse the JSON string we sent into an array
    if (surveyIds === null) {
      this.surveys = new Array<Survey>();
    } else {
      const parsedSurveys = JSON.parse(surveyIds);

      if (parsedSurveys) {
        this.store.dispatch(
          SurveyActions.fetchSurveysSelected({
            surveys: parsedSurveys,
          })
        );

        /**
         * Select selected surveys from the surveys store
         * filtering on once we have fetched the correct
         * number of surveys for the ones we selected.
         */
        this.store
          .select(SurveySelectors.Selected)
          .pipe(filter((selected) => selected.length === parsedSurveys.length))
          .subscribe((selected) => {
            this.surveys = selected;
          });

        this.surveys$ = this.store
          .select(SurveySelectors.Selected)
          .pipe(filter((selected) => selected.length === parsedSurveys.length));
      }
    }
  }
}
