import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import L from 'leaflet';
import 'leaflet-sidebar-v2';
import 'leaflet.locatecontrol';
import * as ToGeojson from 'togeojson';
import * as FileLayer from 'leaflet-filelayer';
import '../../../../../node_modules/leaflet.browser.print/dist/leaflet.browser.print.min.js';
import '../../../../../node_modules/leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.js';
import 'leaflet.markercluster'
import $ from 'jquery'

FileLayer(null, L, ToGeojson);

import { faBars, faBell, faBriefcase, faCalendar, faCaretLeft, faChartPie, faCoffee, faColumns, faEnvelope, faCog, faHistory, faHome, faListOl, faUser, faThumbsUp, faSearch, faLayerGroup, faUpload, faMapPin } from '@fortawesome/free-solid-svg-icons';

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
import { Abriox } from '../models';
import { Survey } from '../models';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';

import { AbrioxEntityService } from '../entity-services/abriox-entity.service';
import { SurveyEntityService } from '../entity-services/survey-entity.service';

import * as fromApp from '../store';
import * as MapActions from '../store/map/map.actions';
import * as SurveyActions from '../store/survey/survey.actions';

import * as SurveySelector from '../store/survey/survey.selectors';
@Component({
  selector: 'geoaudit-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers:[AbrioxEntityService]
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
  faSearch = faSearch;
  faLayerGroup = faLayerGroup;
  faUpload = faUpload;
  faMapPin = faMapPin;

  auth: Auth;
  abrioxes: Array<Abriox>;
  surveys: Array<Survey>;
  abriox:Abriox;

  private map;
  private states;

  clickMarker;
  addMarker; // for add marker to map. status variable.
  url: string;

  sidebar;

  surveyCount$ = this.store.select(SurveySelector.Count);

  constructor(
    private authService: AuthService,
    private markerService: MarkerService,
    private shapeService: ShapeService,
    private abrioxEntityService: AbrioxEntityService,
    private surveyEntityService: SurveyEntityService,
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

    this.store.select('map').subscribe(map => {
      this.url = map.url;
    })

    this.store.dispatch(
      SurveyActions.countSurveys()
    );
  }

  private initMap(): void {
    
    var Basemaps = {
      tiles : L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          minZoom: 3,
          id: 'satellite-v9',
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      ),
      googleSat : L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3']
      }),
      GoogleMap : L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        })
    };
    this.map = L.map('map', {
      center: [environment.coordinates.lat, environment.coordinates.lng],
      layers: [Basemaps.tiles,Basemaps.googleSat,Basemaps.GoogleMap],
      zoom: 8,
      zoomControl : false // remove +/- Zoom Control.
    });

    // Use the custom grouped layer control, not "L.control.layers"
    var layerControl = L.control.groupedLayers(Basemaps);
    this.map.addControl(layerControl);

    // tiles.addTo(this.map);

    //print map. andrey
    L.control.browserPrint().addTo(this.map)
    ////

    // scale map. andrey
    L.control.scale().addTo(this.map);
    ////

    // mylocation. andrey
    L.control.locate({
        position: 'bottomleft',
        strings: {
            title: "Show me where I am, Geoaudit!"
        },
        locateOptions: {
          enableHighAccuracy: true
        }
    }).addTo(this.map);
    ////

    // upload files. andrey

    L.Control.FileLayerLoad.LABEL = '<span class="fa fa-upload" aria-hidden="true"></span>';
    var uploadControl = L.Control.fileLayerLoad({
        // Allows you to use a customized version of L.geoJson.
        layer: L.geoJson,
        // See http://leafletjs.com/reference.html#geojson-options
        layerOptions: {style: {color:'red'}},
        // Add to map after loading (default: true) ?
        addToMap: true,
        // File size limit in kb (default: 1024) ?
        fileSizeLimit: 10240
    }).addTo(this.map);
    
    uploadControl.loader.on('data:loaded', function (event) {
        // event.layer gives you access to the layers you just uploaded!
        console.log(event);
        // Add to map layer switcher
        var layerswitcher = L.control.layers().addTo(this.map);
        layerswitcher.addOverlay(event.layer, event.filename);
    });

    uploadControl.loader.on('data:error', function (error) {
        // Do something usefull with the error!
        alert(error.error);
        console.error(error);
    });
    ////

    // Fetch Markers

    var marke_cluster = L.markerClusterGroup({
			maxClusterRadius: 120,
			iconCreateFunction: function (cluster) {
				var markers = cluster.getAllChildMarkers();
				var n = 0;
				for (var i = 0; i < markers.length; i++) {
					n += markers[i].number;
				}
				return L.divIcon({ html: n, className: 'mycluster', iconSize: L.point(40, 40) });
			},
			//Disable all of the defaults:
			spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false
		});

    this.abrioxEntityService.getAll().subscribe(
      (marker_data) => {
        this.abrioxes = marker_data;
        console.log(marker_data)
        for( var i=0 ;i < this.abrioxes.length ;i ++)
        {
          var a = this.abrioxes[i].testpost.geometry;
          if(!a) continue;
        //   var greenIcon = L.icon({
        //     iconUrl: 'leaf-green.png',
        //     shadowUrl: 'leaf-shadow.png',
        
        //     iconSize:     [38, 95], // size of the icon
        //     shadowSize:   [50, 64], // size of the shadow
        //     iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        //     shadowAnchor: [4, 62],  // the same for the shadow
        //     popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        // });
          var marker_i = L.marker(new L.LatLng(a['lat'], a['lng']), {title: this.abrioxes[i].name });
          marker_i.number = i+1;
          // marker_i.bindPopup(title);
          marke_cluster.addLayer(marker_i);
        }

        // this.map.addLayer(marke_cluster);
        var layerswitcher = L.control.layers().addTo(this.map);
        layerswitcher.addOverlay(marke_cluster, "markers");
      },

      (err) => {}
    )

    // this.surveyEntityService.getAll().subscribe(
    //   (marker_data) => {
    //     this.surveys = marker_data;
    //     console.log(marker_data);
    //   },

    //   (err) => {}
    // )
    ////



    this.map.on('click', (e) => {
      // when addMarker == true, add new marker to map
      console.log(e);
      if(this.addMarker)
      {
        var new_marker = L.marker(e.latlng).addTo(this.map);
        this.map.setView(e.latlng, 13);
        this.addMarker = false;

        var select_popup = '<select class="popup_select"><option value="testpost">Testpost</option><option value="tr">Tr</option><option value="abriox">Abriox</option><option value="survey">Survey</option><option value="resistivity">Resistivity</option></select>';
        select_popup += '<button class="popup_detail_btn">Details<span class="detail_button_icon">></span></button>'
        // new_marker.bindPopup(select_popup , select_popup_css);
        var popup = L.popup({className: 'add_marker_popup' , 'closeButton' : false})
             .setContent(select_popup);
        new_marker.bindPopup(popup);
        new_marker.openPopup();
        
        $(".popup_detail_btn").on('click',e=>{
          var now_op_val = $(".popup_select").val();
          var insert_id = -1;
          switch (now_op_val) {
            case "abriox":
              insert_id = this.abrioxes.length + 1;
              // this.abriox.id =
              this.abrioxEntityService.add({
                name:'',
                telephone: 0,
                serial_number: "",
                date_installation: null,
                footer: null,
                tr:null,
                testpost:null,
                surveys: [],
                abriox_notes: [],
                status: null,
                condition: null
              }).subscribe((notification) => {
                console.log(notification);
                // Do something with notificaiton i.e. display success message
              });
              break;
            case "survey":
              
              break;
              
            default:
              break;
          }
          
                   
          this.router.navigate(['/home/'+now_op_val+'/'+insert_id]);
        });
      }
      ////
      if (this.clickMarker) {
        this.map.removeLayer(this.clickMarker);
      }

      if (this.url) {


      this.clickMarker = new L.marker(e.latlng).addTo(this.map);
      
      this.router.navigate([this.url]);

      this.store.dispatch(MapActions.addClickMarker({ clickMarker: e.latlng }));


      this.sidebar.open('home');

    }
    })
  }

  private initialiseControls(): void {
    this.initializeSidebarControl();
  }

  private initializeSidebarControl(): void {
    this.sidebar = L.control.sidebar({
      autopan: false, // whether to maintain the centered map point when opening the sidebar
      closeButton: true, // whether t add a close button to the panes
      container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
      position: 'right', // left or right,
    });

    this.sidebar.addTo(this.map);

    this.sidebar.on('opening', function(e) {
      // e.id contains the id of the opened panel
    })

    this.sidebar.on('closing', (e) => {
      // e.id contains the id of the opened panel
      console.log('closing')
      

      this.router.navigate(['/home']);
    })

    this.sidebar.on('content', function(e) {
      // e.id contains the id of the opened panel
    })
    
    this.sidebar.open('home');

    this.store.select('map').subscribe(map => {
      if (map.open) {
        this.sidebar.open('home')
      } else {
        this.sidebar.close('home');
      }
    })
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

  //OnClick "Add Marker" Button
  onMarker(): void{
    this.addMarker = true;
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
    //open sidebar when click search btn. andrey
    this.sidebar.open('home');
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
