import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { Router } from '@angular/router';
import L from 'leaflet';
import qs from 'qs';
import 'leaflet-sidebar-v2';
import 'leaflet.locatecontrol';
import * as ToGeojson from 'togeojson';
import * as FileLayer from 'leaflet-filelayer';
import '../../../../../node_modules/leaflet.browser.print/dist/leaflet.browser.print.min.js';
import '../../../../../node_modules/leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.js';
import 'leaflet.markercluster';
import 'leaflet-iconmaterial';
import 'leaflet-draw';
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

import { Auth , Notification, Roles, Statuses} from '../models';
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
import { ToDoListEntityService } from '../entity-services/to-do-list-entity.service';

import * as fromApp from '../store';
import * as MapActions from '../store/map/map.actions';
import * as SurveyActions from '../store/survey/survey.actions';

import * as SurveySelector from '../store/survey/survey.selectors';
import { AlertService } from '../services';
import { NotificationEntityService } from '../entity-services/notification-entity.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectionService } from '../services/selection.service';
import { MyJobEntityService } from '../entity-services/my-job-entity.service';

@Component({
  selector: 'geoaudit-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    AbrioxEntityService,
    TestpostEntityService,
    TrEntityService,
    ResistivityEntityService
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {
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

  survey_complete_layer = new L.markerClusterGroup();
  survey_not_started_layer = new L.markerClusterGroup();
  survey_ongoing_layer = new L.markerClusterGroup();
  survey_refused_layer = new L.markerClusterGroup();
  private surveyFilters = null;

  clickMarker;
  url: string;

  sidebar;

  notifications$: Observable<Array<Notification>> = this.notificationEntityService.entities$.pipe(
    map(notification => {
      return notification.filter(notification => !notification.seen);
    })
  )

  myJobsCount$: Observable<number>;

  approveCount$: Observable<number>;

  toDoList$ = this.toDoListEntityService.entities$;

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
    private notificationEntityService: NotificationEntityService,
    private toDoListEntityService: ToDoListEntityService,
    private myJobEntityService: MyJobEntityService,
    private selectionService: SelectionService,
    private location: Location
  ) {
    this.auth = this.authService.authValue;
  }

  ngOnInit(): void {
    this.notificationEntityService.getAll();
    this.toDoListEntityService.getAll();

    const parameters = qs.stringify({
      _where: {
        assignees: this.authService.authValue.user.id,
        _or: [
          {
            archived: false
          },
          {
            archived_null: true
          }
        ]      }
    });

    this.myJobsCount$ = this.myJobEntityService.count(parameters);

    this.approveCount$ = this.surveyEntityService.count(qs.stringify({
      _where: {
        'status.name': Statuses.COMPLETED,
      },
    }))

    this.selectionService.setSurveyMarkerFilter.subscribe((selected) => {
      this.surveyFilters = selected

      this.survey_complete_layer.clearLayers();
      this.survey_not_started_layer.clearLayers();
      this.survey_ongoing_layer.clearLayers();
      this.survey_refused_layer.clearLayers();
      
      if (this.surveys) {
        this.drawSurveyMarkers(this.surveys, selected);
      }
    });

    this.selectionService.setLocation.subscribe((position) => {
      if (position) {
        const geometry = position.geometry;
        this.map.panTo(new L.LatLng(geometry.lat, geometry.lng))
        this.map.setZoom(9);
      }
    });
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
      OpenStreetMap: L.tileLayer(
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
    //fetch abriox
    var abriox_working_layer = new L.markerClusterGroup();
    var abriox_not_working_layer = new L.markerClusterGroup();
    var abriox_repairing_layer = new L.markerClusterGroup();
    var abriox_replacing_layer = new L.markerClusterGroup();
    this.abrioxEntityService.getAll().subscribe(
      (marker_data) => {
        this.abrioxes = marker_data;
        for( var i=0 ;i < this.abrioxes.length ;i ++)
        {
          var a = this.abrioxes[i];

          // if no geometry data, skip it
          if(!a.testpost || !a.testpost.geometry || !this.abrioxes[i].name) continue;
          // if against Layer rule, skip it
          if(!a.approved ) continue;

          // if no condition data, skip it
          if(!a.condition || !a.condition.name) continue;

          // seperate icons and layers for condition
          var icon_name = "signal_wifi_0_bar";
          switch(a.condition.name)
          {
            case "WORKING":
                icon_name = "signal_wifi_0_bar";
                var busIcon = L.IconMaterial.icon({
                  icon: icon_name,            // Name of Material icon
                  iconColor: '#8AC926',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.testpost.geometry['lat'], a.testpost.geometry['lng']), {icon:busIcon , title: this.abrioxes[i].name });
                var select_popup = '<h2> abriox ' + this.abrioxes[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="notes" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

                var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                    .setContent(select_popup);
                marker_i.bindPopup(popup);
                // marker_i.addTo(abriox_working_layer);
                abriox_working_layer.addLayer(marker_i);
              break;
            case "NOT_WORKING":
                icon_name = "signal_wifi_0_bar";
                var busIcon = L.IconMaterial.icon({
                  icon: icon_name,            // Name of Material icon
                  iconColor: '#E71D36',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.testpost.geometry['lat'], a.testpost.geometry['lng']), {icon:busIcon , title: this.abrioxes[i].name });
                var select_popup = '<h2> abriox ' + this.abrioxes[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="notes" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

                var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                    .setContent(select_popup);
                marker_i.bindPopup(popup);
                // marker_i.addTo(abriox_not_working_layer);
                abriox_not_working_layer.addLayer(marker_i);
              break;
            case "REPAIRING":
                icon_name = "signal_wifi_0_bar";
                var busIcon = L.IconMaterial.icon({
                  icon: icon_name,            // Name of Material icon
                  iconColor: '#3A86FF',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.testpost.geometry['lat'], a.testpost.geometry['lng']), {icon:busIcon , title: this.abrioxes[i].name });
                var select_popup = '<h2> abriox ' + this.abrioxes[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="notes" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

                var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                    .setContent(select_popup);
                marker_i.bindPopup(popup);
                abriox_repairing_layer.addLayer(marker_i);
              break;
            case "REPLACING":
                icon_name = "signal_wifi_0_bar";
                var busIcon = L.IconMaterial.icon({
                  icon: icon_name,            // Name of Material icon
                  iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.testpost.geometry['lat'], a.testpost.geometry['lng']), {icon:busIcon , title: this.abrioxes[i].name });
                var select_popup = '<h2> abriox ' + this.abrioxes[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="notes" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="abrioxes" data-id="'+this.abrioxes[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

                var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                    .setContent(select_popup);
                marker_i.bindPopup(popup);
                abriox_replacing_layer.addLayer(marker_i);
              break;
          }
          
        }
      },

      (err) => {
        this.alertService.error(err.error);
      }
    );

      //fetch testpost
    var testpost_working_layer = new L.markerClusterGroup();
    var testpost_not_working_layer = new L.markerClusterGroup();
    var testpost_repairing_layer = new L.markerClusterGroup();
    var testpost_replacing_layer = new L.markerClusterGroup();
    this.testpostEntityService.getAll().subscribe(
      (marker_data) => {
        marker_data.sort(function(a,b){
          if(a.tp_actions['date'] < b.tp_actions['date'] )
            return -1;
          return 1;
        });
        this.testposts = marker_data;
        
        var flag1 = 0 ,flag2 = 0 , flag3 = 0 , flag4 = 0;
        for( var i=0 ;i < this.testposts.length ;i ++)
        {
          var a = this.testposts[i];

          // if no geometry data, skip it
          if(!a || !a.geometry || !this.testposts[i].name) continue;
          // if against Layer rule, skip it
          if(!a['approved']) continue;

          // if no condition data, skip it
          if(!a.actions || !a.actions.condition || !a.actions.condition.name) continue;

          // seperate icons and layers for condition
          var icon_name = "tv";
          switch(a.actions.condition.name)
          {
            case "WORKING":
              if(flag1 == 0)
              {
                icon_name = "tv";
                var busIcon = L.IconMaterial.icon({
                  icon: icon_name,            // Name of Material icon
                  iconColor: '#8AC926',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.testposts[i].name });
                var select_popup = '<h2> testpost ' + this.testposts[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="history" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="notes" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

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
                  iconColor: '#E71D36',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.testposts[i].name });
                var select_popup = '<h2> testpost ' + this.testposts[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="history" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="notes" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

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
                  iconColor: '#3A86FF',              // Material icon color (could be rgba, hex, html name...)
                  markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                  outlineColor: 'black',            // Marker outline color
                  outlineWidth: 1,                   // Marker outline width 
                  iconSize: [31, 42]                 // Width and height of the icon
                })
                var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.testposts[i].name });
                var select_popup = '<h2> testpost ' + this.testposts[i].name + "</h2><hr>";
                select_popup += '<button data-btn="detail" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="history" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="notes" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

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
                select_popup += '<button data-btn="detail" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                select_popup += '<button data-btn="history" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="notes" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                select_popup += '<button data-btn="drive" data-type="testposts" data-id="'+this.testposts[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

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
      var tr_working_layer = new L.markerClusterGroup();
      var tr_not_working_layer = new L.markerClusterGroup();
      var tr_repairing_layer = new L.markerClusterGroup();
      var tr_replacing_layer = new L.markerClusterGroup();
      this.trEntityService.getAll().subscribe(
        (marker_data) => {
          marker_data.sort(function(a,b){
            if(a.date_installation < b.date_installation )
              return -1;
            return 1;
          });
          this.trs = marker_data;
          
          var flag1 = 0 ,flag2 = 0 , flag3 = 0 , flag4 = 0;
          for( var i=0 ;i < this.trs.length ;i ++)
          {
            var a = this.trs[i];
  
            // if no geometry data, skip it
            if(!a || !a.geometry || !this.trs[i].name) continue;
            // if against Layer rule, skip it
            if(!a.approved) continue;
  
            // if no condition data, skip it
            if(!a.actions || !a.actions.condition || !a.actions.condition.name) continue;
  
            // seperate icons and layers for condition
            var icon_name = "signal_wifi_0_bar";
            switch(a.actions.condition.name)
            {
              case "WORKING":
                if(flag1 == 0)
                {
                  icon_name = "bolt";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: '#8AC926',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.trs[i].name });
                  var select_popup = '<h2> tr ' + this.trs[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="history" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="notes" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  // marker_i.addTo(tr_working_layer);
                  tr_working_layer.addLayer(marker_i);
                  flag1 = 1;
                }
                break;
              case "NOT_WORKING":
                if(flag2 == 0)
                {
                  icon_name = "bolt";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: '#E71D36',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.trs[i].name });
                  var select_popup = '<h2> tr ' + this.trs[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="history" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="notes" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  // marker_i.addTo(tr_not_working_layer);
                  tr_not_working_layer.addLayer(marker_i);
                  flag2 = 1;
                }
                break;
              case "REPAIRING":
                if(flag3 == 0)
                {
                  icon_name = "bolt";
                  var busIcon = L.IconMaterial.icon({
                    icon: icon_name,            // Name of Material icon
                    iconColor: '#3A86FF',              // Material icon color (could be rgba, hex, html name...)
                    markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                    outlineColor: 'black',            // Marker outline color
                    outlineWidth: 1,                   // Marker outline width 
                    iconSize: [31, 42]                 // Width and height of the icon
                  })
                  var marker_i = L.marker(new L.LatLng(a.geometry['lat'], a.geometry['lng']), {icon:busIcon , title: this.trs[i].name });
                  var select_popup = '<h2> tr ' + this.trs[i].name + "</h2><hr>";
                  select_popup += '<button data-btn="detail" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="history" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="notes" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  // marker_i.addTo(tr_repairing_layer);
                  tr_repairing_layer.addLayer(marker_i);
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
                  select_popup += '<button data-btn="detail" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                  select_popup += '<button data-btn="history" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="notes" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                  select_popup += '<button data-btn="drive" data-type="trs" data-id="'+this.trs[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                  var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                      .setContent(select_popup);
                  marker_i.bindPopup(popup);
                  tr_replacing_layer.addLayer(marker_i);
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
      var resistivity_layer = new L.markerClusterGroup();
      this.resistivityEntityService.getAll().subscribe(
        (marker_data) => {
          this.resistivities = marker_data;
          for( var i=0 ;i < this.resistivities.length ;i ++)
          {
            var a = this.resistivities[i];
  
            // if no geometry data and name, skip it
            if(!a || !a.geometry || !a.geometry['lat'] || !a.geometry['lng'] ) continue;
            // if against Layer rule, skip it
            if(!a.approved) continue;

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
              select_popup += '<button data-btn="detail" data-type="resistivities" data-id="'+this.resistivities[i].id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
              select_popup += '<button data-btn="notes" data-type="resistivities" data-id="'+this.resistivities[i].id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
              select_popup += '<button data-btn="drive" data-type="resistivities" data-id="'+this.resistivities[i].id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

              var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                  .setContent(select_popup);
              marker_i.bindPopup(popup);
              // marker_i.addTo(resistivity_layer);
              resistivity_layer.addLayer(marker_i);
          }
        },
  
        (err) => {
          this.alertService.error(err.error);
        }
      );

    //fetch survey
    this.survey_complete_layer = new L.markerClusterGroup();
    this.survey_not_started_layer = new L.markerClusterGroup();
    this.survey_ongoing_layer = new L.markerClusterGroup();
    this.survey_refused_layer = new L.markerClusterGroup();
    this.surveyEntityService.getAll().subscribe(
      (marker_data) => {
        this.surveys = marker_data;
        this.drawSurveyMarkers(this.surveys, this.surveyFilters)
      },

      (err) => {
        this.alertService.error(err.error);
      }
      );
    
    //Show Layers on LayerControl
    var groupedOverlays = {
      "Abriox":{
        "WORKING": abriox_working_layer,
        "NOT_WORKING": abriox_not_working_layer,
        "REPAIRING": abriox_repairing_layer,
        "REPLACING": abriox_replacing_layer
      },
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
        "COMPLETED": this.survey_complete_layer,
        "NOT_STARTED": this.survey_not_started_layer,
        "ONGOING": this.survey_ongoing_layer,
        "REFUSED": this.survey_refused_layer
      },
      "Uploads":{
        
      }
    };

    this.map = L.map('map', {
      center: [environment.coordinates.lat, environment.coordinates.lng],
      layers: [Basemaps.OpenStreetMap,testpost_working_layer,testpost_not_working_layer,testpost_repairing_layer,testpost_replacing_layer,this.survey_complete_layer,this.survey_not_started_layer,this.survey_ongoing_layer,this.survey_refused_layer],
      zoom: 8,
      zoomControl : false // remove +/- Zoom Control.
    });

    var groupLayerOptions = {
      // groupCheckboxes: true,
      position:'topleft'
    };

    var layerControl = L.control.groupedLayers(Basemaps, groupedOverlays, groupLayerOptions);
    this.map.addControl(layerControl);

    var drawControl = new L.Control.Draw({
      position:'bottomleft',
      draw: {
          polyline:false,
          polygon: false,
          rectangle: false,
          circle:false,
          circlemarker:false
      }
  });
    this.map.addControl(drawControl);
    var instance = this;
    this.map.on(L.Draw.Event.CREATED, function (e) {
      var type = e.layerType;
              
      if (type === 'marker') {
          var new_marker = L.marker(e.layer._latlng).addTo(instance.map);
          instance.map.setView(e.layer._latlng);
          var select_popup = '<select class="popup_select"><option value="testpost">Testpost</option><option value="tr">Tr</option><option value="survey">Survey</option><option value="resistivity">Resistivity</option></select>';
          select_popup += '<button class="popup_detail_btn">Details<span class="detail_button_icon">></span></button>'
          // new_marker.bindPopup(select_popup , select_popup_css);
          var popup = L.popup({className: 'add_marker_popup' , 'closeButton' : false})
               .setContent(select_popup);
          new_marker.bindPopup(popup);
          new_marker.openPopup();
  
          var popup_geometry = e.layer._latlng;
          
          $(".popup_detail_btn").on('click',e=>{
            var now_op_val = $(".popup_select").val();
            var insert_id = -1;
            var icon_name = "";
                    
            switch (now_op_val) {
              case "abriox":
                instance.abrioxEntityService.add({
                  testpost:{
                    geometry: {
                      lat: popup_geometry.lat,
                      lng: popup_geometry.lng
                    }
                  }
                }).subscribe((notification) => {
                  insert_id = notification['id'];
                  if(insert_id > 0)
                  {
                    icon_name = "signal_wifi_0_bar";
                    instance.sidebar.open('home');     
                    new_marker.closePopup();
  
                    var busIcon = L.IconMaterial.icon({
                      icon: icon_name,            // Name of Material icon
                      iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                      markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                      outlineColor: 'black',            // Marker outline color
                      outlineWidth: 1,                   // Marker outline width 
                      iconSize: [31, 42]                 // Width and height of the icon
                    })
                    var marker_i = L.marker(new L.LatLng(popup_geometry.lat, popup_geometry.lng), {icon:busIcon , title: "" });
                    var select_popup = '<h2> '+now_op_val+' ' + "" + "</h2><hr>";
                    select_popup += '<button data-btn="detail" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                    if(now_op_val == "testpost" || now_op_val == "tr")
                      select_popup += '<button data-btn="history" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                    select_popup += '<button data-btn="notes" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                    select_popup += '<button data-btn="drive" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                    var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                        .setContent(select_popup);
                    marker_i.bindPopup(popup);
                    marker_i.addTo(instance.map);
                    instance.map.removeLayer(new_marker);
                    instance.router.navigate(['/home/abrioxes/'+insert_id]);
                  }
                });
                break;
              case "testpost":
                instance.testpostEntityService.add({
                  geometry: {
                    lat:popup_geometry.lat,
                    lng:popup_geometry.lng
                  }
                }).subscribe((notification) => {
                  insert_id = notification['id'];
                  if(insert_id > 0)
                  {
                    icon_name = "tv";
                    instance.sidebar.open('home');     
                    new_marker.closePopup();
  
                    var busIcon = L.IconMaterial.icon({
                      icon: icon_name,            // Name of Material icon
                      iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                      markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                      outlineColor: 'black',            // Marker outline color
                      outlineWidth: 1,                   // Marker outline width 
                      iconSize: [31, 42]                 // Width and height of the icon
                    })
                    var marker_i = L.marker(new L.LatLng(popup_geometry.lat, popup_geometry.lng), {icon:busIcon , title: "" });
                    var select_popup = '<h2> '+now_op_val+' ' + "" + "</h2><hr>";
                    select_popup += '<button data-btn="detail" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                      select_popup += '<button data-btn="history" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                    select_popup += '<button data-btn="notes" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                    select_popup += '<button data-btn="drive" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                    var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                        .setContent(select_popup);
                    marker_i.bindPopup(popup);
                    marker_i.addTo(instance.map);
                    instance.map.removeLayer(new_marker);
                    instance.router.navigate(['/home/testposts/'+insert_id]);
                  }
                });
                break;
              case "tr":
                instance.trEntityService.add({
                  geometry: {
                    lat:popup_geometry.lat,
                    lng:popup_geometry.lng
                  }
                }).subscribe((notification) => {
                  insert_id = notification['id'];
                  if(insert_id > 0)
                  {
                    icon_name = "bolt";
                    instance.sidebar.open('home');     
                    new_marker.closePopup();
  
                    var busIcon = L.IconMaterial.icon({
                      icon: icon_name,            // Name of Material icon
                      iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                      markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                      outlineColor: 'black',            // Marker outline color
                      outlineWidth: 1,                   // Marker outline width 
                      iconSize: [31, 42]                 // Width and height of the icon
                    })
                    var marker_i = L.marker(new L.LatLng(popup_geometry.lat, popup_geometry.lng), {icon:busIcon , title: "" });
                    var select_popup = '<h2> '+now_op_val+' ' + "" + "</h2><hr>";
                    select_popup += '<button data-btn="detail" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                      select_popup += '<button data-btn="history" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
                    select_popup += '<button data-btn="notes" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                    select_popup += '<button data-btn="drive" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                    var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                        .setContent(select_popup);
                    marker_i.bindPopup(popup);
                    marker_i.addTo(instance.map);
                    instance.map.removeLayer(new_marker);
                    instance.router.navigate(['/home/trs/'+insert_id]);
                  }
                });
                break;
              case "resistivity":
                  instance.resistivityEntityService.add({
                    date: '2021-04-19T17:54:51.758Z',
                    geometry: {
                      lat:popup_geometry.lat,
                      lng:popup_geometry.lng
                    },
                  }).subscribe((notification) => {
                    insert_id = notification['id'];
                    if(insert_id > 0)
                    {
                      icon_name = "filter_list";
                      instance.sidebar.open('home');     
                      new_marker.closePopup();
  
                      var busIcon = L.IconMaterial.icon({
                        icon: icon_name,            // Name of Material icon
                        iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                        markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                        outlineColor: 'black',            // Marker outline color
                        outlineWidth: 1,                   // Marker outline width 
                        iconSize: [31, 42]                 // Width and height of the icon
                      })
                      var marker_i = L.marker(new L.LatLng(popup_geometry.lat, popup_geometry.lng), {icon:busIcon , title: "" });
                      var select_popup = '<h2> '+now_op_val+' ' + "" + "</h2><hr>";
                      select_popup += '<button data-btn="detail" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                      select_popup += '<button data-btn="notes" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                      select_popup += '<button data-btn="drive" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                      var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                          .setContent(select_popup);
                      marker_i.bindPopup(popup);
                      marker_i.addTo(instance.map);
                      instance.map.removeLayer(new_marker);
                      instance.router.navigate(['/home/resistivities/'+insert_id]);
                    }
                  });
                  break;
              case "survey":
                instance.surveyEntityService.add({
                  geometry: {
                    lat:popup_geometry.lat,
                    lng:popup_geometry.lng
                  }  
                }).subscribe((notification) => {
                  insert_id = notification['id'];
                  if(insert_id > 0)
                    {
                      icon_name = "flag";
                      instance.sidebar.open('home');     
                      new_marker.closePopup();
  
                      var busIcon = L.IconMaterial.icon({
                        icon: icon_name,            // Name of Material icon
                        iconColor: 'black',              // Material icon color (could be rgba, hex, html name...)
                        markerColor: 'rgba(255,255,255,0.8)',  // Marker fill color
                        outlineColor: 'black',            // Marker outline color
                        outlineWidth: 1,                   // Marker outline width 
                        iconSize: [31, 42]                 // Width and height of the icon
                      })
                      var marker_i = L.marker(new L.LatLng(popup_geometry.lat, popup_geometry.lng), {icon:busIcon , title: "" });
                      var select_popup = '<h2> '+now_op_val+' ' + "" + "</h2><hr>";
                      select_popup += '<button data-btn="detail" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
                      select_popup += '<button data-btn="notes" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
                      select_popup += '<button data-btn="drive" data-type="'+now_op_val+'" data-id="'+insert_id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';
  
                      var popup = L.popup({className: 'select_marker_popup' , 'closeButton' : false})
                          .setContent(select_popup);
                      marker_i.bindPopup(popup);
                      marker_i.addTo(instance.map);
                      instance.map.removeLayer(new_marker);
                      instance.router.navigate(['/home/surveys/'+insert_id]);
                    }
                });
                break;
                
              default:
                break;
            }
          });
      }

      // drawnItems.addLayer(layer);
  });
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
        layerOptions: {
          onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name);
          }
          ,style: {color:'red'}
        },
        // Add to map after loading (default: true) ?
        addToMap: true,
        onEachFeature: function (feature, layer) {
          layer.bindPopup("Hello");},
        // File size limit in kb (default: 1024) ?
        fileSizeLimit: 10240
    }).addTo(this.map);
    
    uploadControl.loader.on('data:loaded', function (event) {
        // event.layer gives you access to the layers you just uploaded!
        
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
    
    this.map.on('popupopen', function(e) {
      $(".sp_button").on('click',(e)=>{
        var self = e.currentTarget;
        var type = $(self).data('type');
        var id = $(self).data('id');
        var btn_type = $(self).data('btn');

        instance.sidebar.open('home');
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

  private drawSurveyMarkers(items, selected) {
    items.filter(it => it && it.geometry && it.status && it.status.name)
      .map(a => {
        let iconColor = this.getMarkerIconColor(a.status.name);
        let markerColor = 'rgba(255,255,255,0.8)'
        let outlineColor = 'black'

        if (selected && !selected.find(it => it.id === a.id)) {
          iconColor = '#E0E0E0'
          markerColor = 'rgba(140,140,140,1)'
          outlineColor = 'rgba(140,140,140)'
        }

        const busIcon = this.createIconMaterial(iconColor, markerColor, outlineColor)
        const marker = this.createMarker(busIcon, a);
        this.survey_complete_layer.addLayer(marker);
      })

    if (selected && selected.length === 1) {
      const geometry = selected[0].geometry;
      this.map.setZoom(9);
      this.map.panTo(new L.LatLng(geometry.lat, geometry.lng))
    }
  }

  private getMarkerIconColor(statusName) {
    switch (statusName) {
      case 'COMPLETED':
        return '#8AC926'
      case 'NOT_STARTED':
        return '#E71D36'
      case 'ONGOING':
        return '#FFBE0B'
      case 'REFUSED':
        return '#3A86FF'
    }
    return '#FF0000'
  }

  private createIconMaterial(iconColor, markerColor, outlineColor) {
    return L.IconMaterial.icon({
      icon: 'flag',
      iconColor: iconColor,
      markerColor: markerColor,
      outlineColor: outlineColor,
      outlineWidth: 1,
      iconSize: [31, 42],
    });
  }

  createMarker(busIcon, jobsurvey){
      const marker_i = L.marker(
        new L.LatLng(jobsurvey.geometry['lat'], jobsurvey.geometry['lng']),
        { icon: busIcon, title: jobsurvey.name }
      );
      let select_popup ='<h2> survey ' + jobsurvey.name + '</h2><hr>';
      select_popup += 
        '<button data-btn="detail" data-type="surveys" data-id="' +
        jobsurvey.id +
        '" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
      select_popup +=
        '<button data-btn="notes" data-type="surveys" data-id="' +
        jobsurvey.id +
        '" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
      select_popup +=
        '<button data-btn="drive" data-type="surveys" data-id="' +
        jobsurvey.id +
        '" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

      const popup = L.popup({
        className: 'select_marker_popup',
        closeButton: false,
      }).setContent(select_popup);
      marker_i.bindPopup(popup);
      // marker_i.addTo(survey_complete_layer);
      return marker_i;
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
      //this.router.navigate(['/home/jobs']);
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

  back(): void {
    this.location.back()
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
    this.router.navigate(['/home/events']);
  }

  profile(): void {
    this.router.navigate(['/home/profile']);
  }

  get isRoot(): boolean {
    return this.router.url === '/home';
  }

  isManager() {
    return this.authService.authValue.user.role.name === Roles.MANAGER;
  }
}
