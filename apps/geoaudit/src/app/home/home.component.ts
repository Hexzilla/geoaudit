import { Component, AfterViewInit ,ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import L from 'leaflet';
import 'leaflet-sidebar-v2';
import 'leaflet.locatecontrol';
import * as ToGeojson from 'togeojson';
import * as FileLayer from 'leaflet-filelayer';
import '../../../../../node_modules/leaflet.browser.print/dist/leaflet.browser.print.min.js';
import '../../../../../node_modules/leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.js';
import 'leaflet.markercluster';
import 'leaflet-iconmaterial';
import $ from 'jquery';

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
import { Testpost } from '../models';
import { Tr } from '../models';
import { Resistivity } from '../models';
import { Survey } from '../models';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';

import { AbrioxEntityService } from '../entity-services/abriox-entity.service';
import { TestpostEntityService } from '../entity-services/testpost-entity.service';
import { TrEntityService } from '../entity-services/tr-entity.service';
import { ResistivityEntityService } from '../entity-services/resistivity-entity.service';
import { SurveyEntityService } from '../entity-services/survey-entity.service';

import * as fromApp from '../store';
import * as MapActions from '../store/map/map.actions';
import * as SurveyActions from '../store/survey/survey.actions';

import * as SurveySelector from '../store/survey/survey.selectors';
import { AlertService } from '../services';
@Component({
  selector: 'geoaudit-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers:[
    AbrioxEntityService,
    TestpostEntityService,
    TrEntityService,
    ResistivityEntityService
  ]
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
  testposts: Array<Testpost>;
  trs: Array<Tr>;
  resistivities: Array<Resistivity>;
  surveys: Array<Survey>;


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
    private testpostEntityService: TestpostEntityService,
    private trEntityService: TrEntityService,
    private resistivityEntityService: ResistivityEntityService,
    private surveyEntityService: SurveyEntityService,
    private router: Router,
    private store: Store<fromApp.State>,
    private alertService: AlertService,
    private elementRef: ElementRef
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
      OpenStreetMap : L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          minZoom: 3,
          id: 'satellite-v9',
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      ),
      GoogleSatellite : L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3']
      }),
      GoogleMap : L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        })
    };

    // Fetch Markers and Show with layers
      //fetch testpost
    var testpost_working_layer = new L.LayerGroup();
    var testpost_not_working_layer = new L.LayerGroup();
    var testpost_repairing_layer = new L.LayerGroup();
    var testpost_replacing_layer = new L.LayerGroup();
    this.testpostEntityService.getAll().subscribe(
      (marker_data) => {
        marker_data.sort(function(a,b){
          if(a.tp_actions['date'] < b.tp_actions['date'] )
            return -1;
          return 1;
        });
        this.testposts = marker_data;
        console.log(marker_data)
        var flag1 = 0 ,flag2 = 0 , flag3 = 0 , flag4 = 0;
        for( var i=0 ;i < this.testposts.length ;i ++)
        {
          var a = this.testposts[i];

          // if no geometry data, skip it
          if(!a || !a.geometry || !this.testposts[i].name) continue;
          // if against Layer rule, skip it
          if(a.footer['approved'] != "YES" ) continue;

          // if no condition data, skip it
          if(!a.condition || !a.condition.name) continue;

          // seperate icons and layers for condition
          var icon_name = "tv";
          switch(a.condition.name)
          {
            case "WORKING":
              if(flag1 == 0)
              {
                icon_name = "tv";
                var busIcon = L.IconMaterial.icon({
                  icon: icon_name,            // Name of Material icon
                  iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.testposts[i].name });
                var select_popup = '<h2> testpost ' + this.testposts[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="history" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="notes" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

                var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                    .setContent(select_popup);
                marker_i.bindPopup(popup);
                marker_i.addTo(testpost_working_layer);
                flag1 = 1;
              }
              break;
            case "NOT_WORKING":
              if(flag2 == 0)
              {
                icon_name = "tv";
                var busIcon = L.IconMaterial.icon({
                  icon: icon_name,            // Name of Material icon
                  iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.testposts[i].name });
                var select_popup = '<h2> testpost ' + this.testposts[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="history" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="notes" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

                var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                    .setContent(select_popup);
                marker_i.bindPopup(popup);
                marker_i.addTo(testpost_not_working_layer);
                flag2 = 1;
              }
              break;
            case "REPAIRING":
              if(flag3 == 0)
              {
                icon_name = "tv";
                var busIcon = L.IconMaterial.icon({
                  icon: icon_name,            // Name of Material icon
                  iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.testposts[i].name });
                var select_popup = '<h2> testpost ' + this.testposts[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="history" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="notes" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

                var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                    .setContent(select_popup);
                marker_i.bindPopup(popup);
                marker_i.addTo(testpost_repairing_layer);
                flag3 = 1;
              }
              break;
            case "REPLACING":
              if(flag4 == 0)
              {
                icon_name = "tv";
                var busIcon = L.IconMaterial.icon({
                  icon: icon_name,            // Name of Material icon
                  iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.testposts[i].name });
                var select_popup = '<h2> testpost ' + this.testposts[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="history" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="notes" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="testpost" data-id="'+this.testposts[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

                var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                    .setContent(select_popup);
                marker_i.bindPopup(popup);
                marker_i.addTo(testpost_replacing_layer);
                flag4 = 1;
              }
              break;
          }
          
        }
      },

      (err) => {
        this.alertService.error(err.error);
      }
    );

      //fetch tr
      var tr_working_layer = new L.LayerGroup();
      var tr_not_working_layer = new L.LayerGroup();
      var tr_repairing_layer = new L.LayerGroup();
      var tr_replacing_layer = new L.LayerGroup();
      this.trEntityService.getAll().subscribe(
        (marker_data) => {
          marker_data.sort(function(a,b){
            if(a.date_installation < b.date_installation )
              return -1;
            return 1;
          });
          this.trs = marker_data;
          console.log(marker_data)
          var flag1 = 0 ,flag2 = 0 , flag3 = 0 , flag4 = 0;
          for( var i=0 ;i < this.trs.length ;i ++)
          {
            var a = this.trs[i];
  
            // if no geometry data, skip it
            if(!a || !a.geometry || !this.trs[i].name) continue;
            // if against Layer rule, skip it
            if(!a.footer.approved) continue;
  
            // if no condition data, skip it
            if(!a.condition || !a.condition.name) continue;
  
            // seperate icons and layers for condition
            var icon_name = "signal_wifi_0_bar";
            switch(a.condition.name)
            {
              case "WORKING":
                if(flag1 == 0)
                {
                  icon_name = "bolt";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.trs[i].name });
                  var select_popup = '<h2> tr ' + this.trs[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="history" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="notes" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  marker_i.addTo(tr_working_layer);
                  flag1 = 1;
                }
                break;
              case "NOT_WORKING":
                if(flag2 == 0)
                {
                  icon_name = "bolt";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.trs[i].name });
                  var select_popup = '<h2> tr ' + this.trs[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="history" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="notes" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  marker_i.addTo(tr_not_working_layer);
                  flag2 = 1;
                }
                break;
              case "REPAIRING":
                if(flag3 == 0)
                {
                  icon_name = "bolt";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.trs[i].name });
                  var select_popup = '<h2> tr ' + this.trs[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="history" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="notes" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  marker_i.addTo(tr_repairing_layer);
                  flag3 = 1;
                }
                break;
              case "REPLACING":
                if(flag4 == 0)
                {
                  icon_name = "bolt";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.trs[i].name });
                  var select_popup = '<h2> tr ' + this.trs[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="history" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="notes" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="tr" data-id="'+this.trs[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  marker_i.addTo(tr_replacing_layer);
                  flag4 = 1;
                }
                break;
            }
          }
        },
  
        (err) => {
          this.alertService.error(err.error);
        }
      );

      //fetch resistivites
      var resistivity_layer = new L.LayerGroup();
      this.resistivityEntityService.getAll().subscribe(
        (marker_data) => {
         
          this.resistivities = marker_data;
          console.log(marker_data)
          for( var i=0 ;i < this.resistivities.length ;i ++)
          {
            var a = this.resistivities[i];
  
            // if no geometry data and name, skip it
            // if(!a || !a.geometry || !this.resistivities[i].name) continue;
            // if against Layer rule, skip it
            if(!a.footer.approved) continue;

            if(!a.status || a.status.name != "COMPLETED") continue;
  
            // if no condition data, skip it
            // if(!a.condition || !a.condition.name) continue;

              var icon_name = "filter_list";
              var busIcon = L.IconMaterial.icon({
                icon: icon_name,            // Name of Material icon
                iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                outlineColor: 'black',            // Marker outline color
                outlineWidth: 1,                   // Marker outline width 
                iconSize: [31, 42]                 // Width and height of the icon
              })
              var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: "this.resistivities[i].name" });
              var select_popup = '<h2> resistivity ' + this.resistivities[i].reference + "</h2><hr>";
              select_popup += '<button data-btn="detail" data-type="resistivity" data-id="'+this.resistivities[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
              select_popup += '<button data-btn="notes" data-type="resistivity" data-id="'+this.resistivities[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
              select_popup += '<button data-btn="drive" data-type="resistivity" data-id="'+this.resistivities[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

              var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                  .setContent(select_popup);
              marker_i.bindPopup(popup);
              marker_i.addTo(resistivity_layer);
          }
        },
  
        (err) => {
          this.alertService.error(err.error);
        }
      );

      //fetch survey
      var survey_complete_layer = new L.LayerGroup();
      var survey_not_complete_layer = new L.LayerGroup();
      var survey_ongoing_layer = new L.LayerGroup();
      var survey_refused_layer = new L.LayerGroup();
      this.surveyEntityService.getAll().subscribe(
        (marker_data) => {
          this.surveys = marker_data;
          console.log(marker_data)
          for( var i=0 ;i < this.surveys.length ;i ++)
          {
            var a = this.surveys[i];
  
            // if no geometry data, skip it
            if(!a || !a.geometry || !this.surveys[i].name) continue;
            // if against Layer rule, skip it
            if(!a.footer.approved) continue;
  
            // if no status data, skip it
            if(!a.status || !a.status.name) continue;
  
            // seperate icons and layers for condition
            var icon_name = "flag";
            switch(a.status.name)
            {
              case "COMPLETED":
                  icon_name = "flag";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.surveys[i].name });
                  var select_popup = '<h2> survey ' + this.surveys[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="notes" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  marker_i.addTo(survey_complete_layer);
                break;
              case "NOT_COMPLETED":
                  icon_name = "flag";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.surveys[i].name });
                  var select_popup = '<h2> survey ' + this.surveys[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="notes" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  marker_i.addTo(survey_not_complete_layer);
                break;
              case "ONGOING":
                  icon_name = "flag";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.surveys[i].name });
                  var select_popup = '<h2> survey ' + this.surveys[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="notes" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  marker_i.addTo(survey_ongoing_layer);
                break;
              case "REFUSED":
                  icon_name = "flag";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.surveys[i].name });
                  var select_popup = '<h2> survey ' + this.surveys[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="notes" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="survey" data-id="'+this.surveys[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  marker_i.addTo(survey_refused_layer);
                break;
            }
          }
        },
  
        (err) => {
          this.alertService.error(err.error);
        }
      );
    
    //Show Layers on LayerControl
    var groupedOverlays = {
      "Testpost": {
        "WORKING": testpost_working_layer,
        "NOT_WORKING": testpost_not_working_layer,
        "REPAIRING": testpost_repairing_layer,
        "REPLACING": testpost_replacing_layer
      },
      "TR": {
        "WORKING": tr_working_layer,
        "NOT_WORKING": tr_not_working_layer,
        "REPAIRING": tr_repairing_layer,
        "REPLACING": tr_replacing_layer
      },
      "Resistivity":{
        "Resistivity":resistivity_layer
      },
      "Surveys": {
        "COMPLETED": survey_complete_layer,
        "NOT_COMPLETED": survey_not_complete_layer,
        "ONGOING": survey_ongoing_layer,
        "REFUSED": survey_refused_layer
      },
      "Uploads":{
        
      }
    };

    this.map = L.map('map', {
      center: [environment.coordinates.lat, environment.coordinates.lng],
      layers: [Basemaps.OpenStreetMap,Basemaps.GoogleSatellite,Basemaps.GoogleMap,testpost_working_layer,testpost_not_working_layer,testpost_repairing_layer,testpost_replacing_layer,survey_complete_layer,survey_not_complete_layer,survey_ongoing_layer,survey_refused_layer],
      zoom: 8,
      zoomControl : false // remove +/- Zoom Control.
    });

    var groupLayerOptions = {
      groupCheckboxes: true,
      position:'topleft'
    };

    var layerControl = L.control.groupedLayers(Basemaps, groupedOverlays, groupLayerOptions);
    this.map.addControl(layerControl);
    
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
        // var layerswitcher = L.control.layers().addTo(this.map);
        layerControl.addOverlay(event.layer, event.filename , "Uploads");
    });

    uploadControl.loader.on('data:error', function (error) {
        // Do something usefull with the error!
        console.error(error['error']);
        this.alertService.error(error.error);
    });
    ////
    
    var instance = this;
    this.map.on('popupopen', function(e) {
      $(".sp_button").on('click',(e)=>{
        var self = e.currentTarget;
        var type = $(self).data('type');
        var id = $(self).data('id');
        var btn_type = $(self).data('btn');
        switch(btn_type)
        {
          case "detail":
            instance.router.navigate(['/home/'+type+'/'+id]);
            break;
          case "history":
            instance.router.navigate(['/home/'+type+'/'+id+"/history"]);
            break;
          case "notes":
            instance.router.navigate(['/home/'+type+'/'+id+"/notes"]);
            break;
          case "drive":
            instance.router.navigate(['/home/'+type+'/'+id+"/drive"]);
            break;
        }
        
      });
    });

    this.map.on('click', (e) => {
      // when addMarker == true, add new marker to map
      console.log(e);
      if(this.addMarker)
      {
        var new_marker = L.marker(e.latlng).addTo(this.map);
        this.map.setView(e.latlng, 13);
        this.addMarker = false;
        var select_popup = '<select class="popup_select"><option value="testpost">Testpost</option><option value="tr">Tr</option><option value="survey">Survey</option><option value="resistivity">Resistivity</option></select>';
        select_popup += '<button class="popup_detail_btn">Details<span class="detail_button_icon">></span></button>'
        // new_marker.bindPopup(select_popup , select_popup_css);
        var popup = L.popup({className: 'add_marker_popup' , 'closeButton' : false})
             .setContent(select_popup);
        new_marker.bindPopup(popup);
        new_marker.openPopup();

        var popup_geometry = e.latlng;
        
        $(".popup_detail_btn").on('click',e=>{
          var now_op_val = $(".popup_select").val();
          var insert_id = -1;
          switch (now_op_val) {
            case "abriox":
              this.abrioxEntityService.add({
                testpost:{
                  geometry: {
                    lat: popup_geometry.lat,
                    lng: popup_geometry.lng
                  }
                }
              }).subscribe((notification) => {
                insert_id = notification['id'];
                console.log(insert_id);
                this.router.navigate(['/home/abriox/'+insert_id]);
              });
              break;
            case "testpost":
              this.testpostEntityService.add({
                tp_actions: null,
                abriox: null,
                reference: null,
                name: '',
                date_installation: null,
                manufacture: null,
                model: null,
                serial_number: '',
                geometry: {
                  lat:popup_geometry.lat,
                  lng:popup_geometry.lng
                },
                footer: [],
                tp_notes: null,
                status: null,
                condition: null,
                tp_type: null
              }).subscribe((notification) => {
                insert_id = notification['id'];
                console.log(insert_id);
                this.router.navigate(['/home/testpost/'+insert_id]);
              });
              break;
            case "tr":
              this.trEntityService.add({
                name: '',
                abriox: null,
                footer: null,
                fault_detail: [],
                serial_number: '',
                date_installation: null,
                geometry: {
                  lat:popup_geometry.lat,
                  lng:popup_geometry.lng
                },
                tr_notes: [],
                status: null,
                condition: null,
                reference: null
              }).subscribe((notification) => {
                insert_id = notification['id'];
                console.log(insert_id);
                this.router.navigate(['/home/tr/'+insert_id]);
              });
              break;
            case "resistivity":
                this.resistivityEntityService.add({
                  reference: '',
                  date: '2021-04-19T17:54:51.758Z',
                  geometry: {
                    lat:popup_geometry.lat,
                    lng:popup_geometry.lng
                  },
                  survey: null,
                  resistivity_detail: [],
                  footer: null,
                  resistivity_notes: null,
                  status: null
                }).subscribe((notification) => {
                  insert_id = notification['id'];
                  console.log(insert_id);
                  this.router.navigate(['/home/resistivity/'+insert_id]);
                });
                break;
            case "survey":
              this.surveyEntityService.add({
                abrioxes: null,
                conducted_by: null,
                created_at: null,
                date_assigned: null,
                date_delivery: null,
                footer: null,
                geometry: {
                  lat:popup_geometry.lat,
                  lng:popup_geometry.lng
                },
                id: null,
                reference: null,
                job: null,
                name: '',
                prepared_by: null,
                resistivities: [],
                site: null,
                status: null,
                survey_notes: [],
                tp_actions: [],
                tr_actions: []   
              }).subscribe((notification) => {
                insert_id = notification['id'];
                console.log(insert_id);
                this.router.navigate(['/home/survey/'+insert_id]);
              });
              break;
              
            default:
              break;
          }
          
                   
          
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
