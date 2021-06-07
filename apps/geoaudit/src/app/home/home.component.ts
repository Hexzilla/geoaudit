import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import L from 'leaflet';
import 'leaflet-sidebar-v2';

import { faBars, faBell, faBriefcase, faCalendar, faCaretLeft, faChartPie, faCoffee, faColumns, faEnvelope, faCog, faHistory, faHome, faListOl, faUser, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

import { MarkerService } from '../services/marker.service';
import { ShapeService } from '../services/shape.service';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

import { Auth } from '../models';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';

import * as fromApp from '../store';
import * as MapActions from '../store/map/map.actions';

@Component({
  selector: 'geoaudit-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  // Icons
  faBars = faBars;
  faBell = faBell;
  faBriefcase = faBriefcase;
  faCalendar = faCalendar;
  faCaretLeft = faCaretLeft;
  faChartPie = faChartPie;
  faCoffee = faCoffee;
  faCog = faCog;
  faColumns = faColumns;
  faEnvelope = faEnvelope;
  faHistory = faHistory;
  faHome = faHome;
  faListOl = faListOl;
  faThumbsUp = faThumbsUp;
  faUser = faUser;

  auth: Auth;

  private map;
  private states;

  clickMarker;

  constructor(
    private authService: AuthService,
    private markerService: MarkerService,
    private shapeService: ShapeService,
    private router: Router,
    private store: Store<fromApp.State>,
  ) {
    this.auth = this.authService.authValue;
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initialiseControls();

    // this.markerService.makeCapitalMarkers(this.map);
    this.markerService.makeCapitalCircleMarkers(this.map);
    this.shapeService.getStateShapes().subscribe((states) => {
      this.states = states;
      this.initStatesLayer();
    });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [environment.coordinates.lat, environment.coordinates.lng],
      zoom: 8,
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);

    this.map.on('click', (e) => {
      console.log('click', e.latlng)

      if (this.clickMarker) {
        this.map.removeLayer(this.clickMarker);
      }

      this.clickMarker = new L.marker(e.latlng).addTo(this.map);

      this.store.dispatch(MapActions.addClickMarker({ clickMarker: e.latlng }));

    })
  }

  private initialiseControls(): void {
    this.initializeSidebarControl();
  }

  private initializeSidebarControl(): void {
    const sidebar = L.control.sidebar({
      autopan: false, // whether to maintain the centered map point when opening the sidebar
      closeButton: true, // whether t add a close button to the panes
      container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
      position: 'right', // left or right,
    });

    sidebar.addTo(this.map);

    sidebar.on('opening', function(e) {
      // e.id contains the id of the opened panel
    })

    sidebar.on('closing', (e) => {
      // e.id contains the id of the opened panel
      console.log('closing')
      

      this.router.navigate(['/home']);
    })

    sidebar.on('content', function(e) {
      // e.id contains the id of the opened panel
    })
    
    sidebar.open('home');
  }

  private initStatesLayer() {
    const stateLayer = L.geoJSON(this.states, {
      style: (feature) => ({
        weight: 3,
        opacity: 0.5,
        color: '#008f68',
        fillOpacity: 0.8,
        fillColor: '#6DB65B',
      }),
      onEachFeature: (feature, layer) =>
        layer.on({
          mouseover: (e) => this.highlightFeature(e),
          mouseout: (e) => this.resetFeature(e),
        }),
    });

    this.map.addLayer(stateLayer);
    stateLayer.bringToBack();
  }

  private highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
      weight: 10,
      opacity: 1.0,
      color: '#DFA612',
      fillOpacity: 1.0,
      fillColor: '#FAE042',
    });
  }

  private resetFeature(e) {
    const layer = e.target;

    layer.setStyle({
      weight: 3,
      opacity: 0.5,
      color: '#008f68',
      fillOpacity: 0.8,
      fillColor: '#6DB65B',
    });
  }

  toDoList(): void {
    this.router.navigate(['/home/todolist']);
  }

  jobs(): void {
    this.router.navigate(['/home/jobs']);
  }

  recentSurveys(): void {
    this.router.navigate(['/home/surveys']);
  }

  approve(): void {
    this.router.navigate(['/home/approvals']);
  }

  home(): void {
    this.router.navigate(['/home']);
  }

  search(): void {
    this.router.navigate(['/home/search']);
  }

  calendar(): void {
    this.router.navigate(['/home/calendar']);
  }

  notifications(): void {
    this.router.navigate(['/home/notifications']);
  }

  profile(): void {
    this.router.navigate(['/home/profile']);
  }

  get isRoot(): boolean {
    return this.router.url === '/home';
  }
}
