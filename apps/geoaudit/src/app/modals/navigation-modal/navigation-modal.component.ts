import { Component, Inject, OnInit } from '@angular/core';
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

export interface DialogData {
  surveys: Array<Survey>;
}

@Component({
  selector: 'geoaudit-navigation-modal',
  templateUrl: './navigation-modal.component.html',
  styleUrls: ['./navigation-modal.component.scss']
})
export class NavigationModalComponent implements OnInit {

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
  }

  onYesClick(): void {
    window.open(this.url);

    this.dialogRef.close(true);
  }

  isSubmitDisabled(): boolean {
    return !this.selectedDestinationType;
  }
}