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
import * as moment from 'moment';

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
import { ConditionEntityService } from '../entity-services/condition-entity.service';

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
import { I } from '@angular/cdk/keycodes';

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

  private survey_complete_layer = new L.markerClusterGroup();
  private survey_not_started_layer = new L.markerClusterGroup();
  private survey_ongoing_layer = new L.markerClusterGroup();
  private survey_refused_layer = new L.markerClusterGroup();
  private survey_na_layer = new L.markerClusterGroup();
  private surveyFilters = new L.markerClusterGroup();

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
    private conditionEntityService: ConditionEntityService,
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

      this.survey_complete_layer?.clearLayers();
      this.survey_not_started_layer?.clearLayers();
      this.survey_ongoing_layer?.clearLayers();
      this.survey_refused_layer?.clearLayers();
      this.survey_na_layer?.clearLayers();
      
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
    const Basemaps = {
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
    const abriox_working_layer = new L.markerClusterGroup();
    const abriox_not_working_layer = new L.markerClusterGroup();
    const abriox_repairing_layer = new L.markerClusterGroup();
    const abriox_replacing_layer = new L.markerClusterGroup();
    const abriox_na_layer = new L.markerClusterGroup();
    this.abrioxEntityService.getAll().subscribe(
      (marker_data) => {
        this.abrioxes = marker_data;
        console.log("abrioxes", this.abrioxes)
        
        const _abrioxes = marker_data
          .filter(it => it.name && it.approved)
          .filter(it => (it.testpost && it.testpost.geometry) || (it.tr && it.tr.geometry))
          .map(abriox => {
            const actions = abriox.abriox_actions?.filter(it => it.approved)
            if (!actions || actions.length <= 0) {
              return { ...abriox, condition: null }
            }
            const action = actions.reduce((a, b) => {
              const diff = moment(a.date).diff(moment(b.date), 'seconds')
              return (diff > 0) ? a : b
            });
            return { ...abriox, condition: action.condition || 0 }
          })

        //console.log("abriox.filtered", _abrioxes)
        _abrioxes.map(abriox => {
          if (abriox && abriox.condition) {
            const iconColor = this.getTestpostMarkerIconColor(abriox.condition);
            const markerColor = 'rgba(255, 255, 255, 0.8)';
            const outlineColor = 'black';
            const busIcon = this.createIconMaterial("signal_wifi_0_bar", iconColor, markerColor, outlineColor)
            const marker = this.createAbrioxMarker(busIcon, abriox);

            if (abriox.condition == 1) {
              marker.addTo(abriox_working_layer);
            }
            else if (abriox.condition == 2) {
              marker.addTo(abriox_not_working_layer);
            }
            else if (abriox.condition == 3) {
              marker.addTo(abriox_repairing_layer);
            }
            else if (abriox.condition == 4) {
              marker.addTo(abriox_replacing_layer);
            }
          }
          else {
            const iconColor = 'black';
            const markerColor = 'rgba(255, 255, 255, 0.8)';
            const outlineColor = 'black';
            const busIcon = this.createIconMaterial("signal_wifi_0_bar", iconColor, markerColor, outlineColor)
            const marker = this.createAbrioxMarker(busIcon, abriox);
            marker.addTo(abriox_na_layer);
          }
        })
      },

      (err) => {
        this.alertService.error(err.error);
      }
    );

    //fetch testpost
    const testpost_working_layer = new L.markerClusterGroup();
    const testpost_not_working_layer = new L.markerClusterGroup();
    const testpost_repairing_layer = new L.markerClusterGroup();
    const testpost_replacing_layer = new L.markerClusterGroup();
    const testpost_na_layer = new L.markerClusterGroup();
    this.testpostEntityService.getAll().subscribe(
      (marker_data) => {
        this.testposts = marker_data;
        console.log("testposts", this.testposts)
        
        const _testposts = marker_data
          .filter(it => it.name && it.geometry && it.approved)
          .map(tp => {
            const actions = tp.tp_actions?.filter(it => it.approved)
            if (!actions || actions.length <= 0) {
              return { ...tp, condition: null }
            }
            const action = actions.reduce((a, b) => {
              const diff = moment(a.date).diff(moment(b.date), 'seconds')
              return (diff > 0) ? a : b
            });
            return { ...tp, condition: action.condition || 0 }
          })

        //console.log("testposts.filtered", _testposts)
        _testposts.map(testpost => {
          if (testpost && testpost.condition) {
            const iconColor = this.getTestpostMarkerIconColor(testpost.condition);
            const markerColor = 'rgba(255, 255, 255, 0.8)';
            const outlineColor = 'black';
            const busIcon = this.createIconMaterial("tv", iconColor, markerColor, outlineColor)
            const marker = this.createTestpostMarker(busIcon, testpost);

            if (testpost.condition == 1) {
              marker.addTo(testpost_working_layer);
            }
            else if (testpost.condition == 2) {
              marker.addTo(testpost_not_working_layer);
            }
            else if (testpost.condition == 3) {
              marker.addTo(testpost_repairing_layer);
            }
            else if (testpost.condition == 4) {
              marker.addTo(testpost_replacing_layer);
            }
          }
          else {
            const iconColor = 'black';
            const markerColor = 'rgba(255, 255, 255, 0.8)';
            const outlineColor = 'black';
            const busIcon = this.createIconMaterial("tv", iconColor, markerColor, outlineColor)
            const marker = this.createTestpostMarker(busIcon, testpost);
            marker.addTo(testpost_na_layer);
          }
        })
      },

      (err) => {
        this.alertService.error(err.error);
      }
    );

    //fetch tr
    const tr_working_layer = new L.markerClusterGroup();
    const tr_not_working_layer = new L.markerClusterGroup();
    const tr_repairing_layer = new L.markerClusterGroup();
    const tr_replacing_layer = new L.markerClusterGroup();
    const tr_na_layer = new L.markerClusterGroup();
    this.trEntityService.getAll().subscribe(
      (marker_data) => {
        this.trs = marker_data;
        console.log("trs", this.trs)
        
        const _trs = marker_data
          .filter(it => it.name && it.geometry && it.approved)
          .map(tr => {
            const actions = tr.tr_actions?.filter(it => it.approved)
            if (!actions || actions.length <= 0) {
              return { ...tr, condition: null }
            }
            const action = actions.reduce((previous, current) => {
              const diff = moment(previous.date).diff(moment(current.date), 'seconds')
              return (diff > 0) ? previous : current
            });
            return { ...tr, condition: action.condition || 0 }
          })

        //console.log("trs.filtered", _trs)
        _trs.map(tr => {
          if (tr && tr.condition) {
            const iconColor = this.getTestpostMarkerIconColor(tr.condition);
            const markerColor = 'rgba(255, 255, 255, 0.8)';
            const outlineColor = 'black';
            const busIcon = this.createIconMaterial("bolt", iconColor, markerColor, outlineColor)
            const marker = this.createTrMarker(busIcon, tr);

            if (tr.condition == 1) {
              marker.addTo(tr_working_layer);
            }
            else if (tr.condition == 2) {
              marker.addTo(tr_not_working_layer);
            }
            else if (tr.condition == 3) {
              marker.addTo(tr_repairing_layer);
            }
            else if (tr.condition == 4) {
              marker.addTo(tr_replacing_layer);
            }
          }
          else {
            const iconColor = 'black'
            const markerColor = 'rgba(255, 255, 255, 0.8)';
            const outlineColor = 'black';
            const busIcon = this.createIconMaterial("bolt", iconColor, markerColor, outlineColor)
            const marker = this.createTrMarker(busIcon, tr);
            marker.addTo(tr_na_layer);
          }
        })
      },

      (err) => {
        this.alertService.error(err.error);
      }
    );

    //fetch resistivites
    const resistivity_layer = new L.markerClusterGroup();
    this.resistivityEntityService.getAll().subscribe(
      (marker_data) => {
        this.resistivities = marker_data;
        console.log("resistivities", this.resistivities)
        
        const _resistivities = marker_data.filter(it => it.reference && it.geometry && it.approved)
        //console.log("resistivities.filtered", _resistivities)

        _resistivities.map(tr => {
          const iconColor = 'black';
          const markerColor = 'rgba(255, 255, 255, 0.8)';
          const outlineColor = 'black';
          const busIcon = this.createIconMaterial("filter_list", iconColor, markerColor, outlineColor)
          const marker = this.createResistivityMarker(busIcon, tr);
          resistivity_layer.addLayer(marker);
        })
      },

      (err) => {
        this.alertService.error(err.error);
      }
    );

    //fetch survey
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
    const groupedOverlays = {
      "Abriox":{
        "WORKING": abriox_working_layer,
        "NOT_WORKING": abriox_not_working_layer,
        "REPAIRING": abriox_repairing_layer,
        "REPLACING": abriox_replacing_layer,
        "N/A": abriox_na_layer,
      },
      "Testpost": {
        "WORKING": testpost_working_layer,
        "NOT_WORKING": testpost_not_working_layer,
        "REPAIRING": testpost_repairing_layer,
        "REPLACING": testpost_replacing_layer,
        "N/A": testpost_na_layer,
      },
      "TR": {
        "WORKING": tr_working_layer,
        "NOT_WORKING": tr_not_working_layer,
        "REPAIRING": tr_repairing_layer,
        "REPLACING": tr_replacing_layer,
        "N/A": tr_na_layer
      },
      "Resistivity":{
        "Resistivity":resistivity_layer
      },
      "Surveys": {
        "COMPLETED": this.survey_complete_layer,
        "NOT_STARTED": this.survey_not_started_layer,
        "ONGOING": this.survey_ongoing_layer,
        "REFUSED": this.survey_refused_layer,
        "N/A": this.survey_na_layer,
      },
      "Uploads":{
        
      }
    };

    this.map = L.map('map', {
      center: [ environment.coordinates.lat, environment.coordinates.lng ],
      layers: [
        Basemaps.OpenStreetMap,
        testpost_working_layer,
        testpost_not_working_layer,
        testpost_repairing_layer,
        testpost_replacing_layer,
        testpost_na_layer,
        this.survey_complete_layer,
        this.survey_not_started_layer,
        this.survey_ongoing_layer,
        this.survey_refused_layer,
        this.survey_na_layer
      ],
      zoom: 8,
      zoomControl : false // remove +/- Zoom Control.
    });

    const groupLayerOptions = {
      // groupCheckboxes: true,
      position:'topleft'
    };

    const layerControl = L.control.groupedLayers(Basemaps, groupedOverlays, groupLayerOptions);
    this.map.addControl(layerControl);

    const drawControl = new L.Control.Draw({
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

  private drawSurveyMarkers(items: Array<Survey>, selected) {
    items
      .filter(it => it && it.geometry)
      .filter(it => it.job && it.job.assignees && it.job.assignees.length > 0)
      .filter(it => it.job.assignees.find(a => a.id == this.authService.authValue.user.id))
      .map(it => {
        if (it.status && it.status.name) {
          let iconColor = this.getMarkerIconColor(it.status.name);
          let markerColor = 'rgba(255,255,255,0.8)'
          let outlineColor = 'black'

          if (selected && !selected.find(x => x.id === it.id)) {
            iconColor = '#E0E0E0'
            markerColor = 'rgba(140,140,140,1)'
            outlineColor = 'rgba(140,140,140)'
          }

          const busIcon = this.createFlagIconMaterial(iconColor, markerColor, outlineColor)
          const marker = this.createMarker(busIcon, it);
          this.survey_complete_layer.addLayer(marker);
        }
        else {
          const iconColor = 'black'
          const markerColor = 'rgba(255,255,255,0.8)'
          const outlineColor = 'black'

          const busIcon = this.createFlagIconMaterial(iconColor, markerColor, outlineColor)
          const marker = this.createMarker(busIcon, it);
          this.survey_na_layer.addLayer(marker);
        }
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

  private getTestpostMarkerIconColor(condition) {
    switch (condition) {
      case 1:
        return '#8AC926'
      case 2:
        return '#E71D36'
        case 3:
          return '#3A86FF'
      case 4:
        return 'black';
    }
    return '#FF0000'
  }

  private createFlagIconMaterial(iconColor, markerColor, outlineColor) {
    return this.createIconMaterial('flag', iconColor, markerColor, outlineColor);
  }

  private createIconMaterial(icon, iconColor, markerColor, outlineColor) {
    return L.IconMaterial.icon({
      icon,
      iconColor,
      markerColor,
      outlineColor,
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

  createAbrioxMarker(busIcon, abriox) {
    const geometry = abriox.testpost?.geometry || abriox.tr?.geometry;
    const marker_i = L.marker(
      new L.LatLng(geometry['lat'], geometry['lng']),
      { icon: busIcon, title: abriox.name }
    );

    let select_popup = '<h2> abriox ' + abriox.name + "</h2><hr>";
    select_popup += '<button data-btn="detail" data-type="abrioxes" data-id="'+abriox.id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
    select_popup += '<button data-btn="notes" data-type="abrioxes" data-id="'+abriox.id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
    select_popup += '<button data-btn="drive" data-type="abrioxes" data-id="'+abriox.id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

    const popup = L.popup({
      className: 'select_marker_popup',
      closeButton: false,
    }).setContent(select_popup);
    marker_i.bindPopup(popup);

    return marker_i;
  }

  createTestpostMarker(busIcon, testpost) {
    const marker_i = L.marker(
      new L.LatLng(testpost.geometry['lat'], testpost.geometry['lng']),
      { icon: busIcon, title: testpost.name }
    );

    let select_popup = '<h2> testpost ' + testpost.name + "</h2><hr>";
    select_popup += '<button data-btn="detail" data-type="testposts" data-id="'+testpost.id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
    select_popup += '<button data-btn="history" data-type="testposts" data-id="'+testpost.id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
    select_popup += '<button data-btn="notes" data-type="testposts" data-id="'+testpost.id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
    select_popup += '<button data-btn="drive" data-type="testposts" data-id="'+testpost.id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

    const popup = L.popup({
      className: 'select_marker_popup',
      closeButton: false,
    }).setContent(select_popup);
    marker_i.bindPopup(popup);

    return marker_i;
  }

  createTrMarker(busIcon, tr) {
    const marker_i = L.marker(
      new L.LatLng(tr.geometry['lat'], tr.geometry['lng']),
      { icon: busIcon, title: tr.name }
    );

    let select_popup = '<h2> tr ' + tr.name + "</h2><hr>";
    select_popup += '<button data-btn="detail" data-type="trs" data-id="'+tr.id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
    select_popup += '<button data-btn="history" data-type="trs" data-id="'+tr.id+'" class="sp_button">Historical data<span class="detail_button_icon">></span></button>';
    select_popup += '<button data-btn="notes" data-type="trs" data-id="'+tr.id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
    select_popup += '<button data-btn="drive" data-type="trs" data-id="'+tr.id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

    const popup = L.popup({
      className: 'select_marker_popup',
      closeButton: false,
    }).setContent(select_popup);
    marker_i.bindPopup(popup);

    return marker_i;
  }

  createResistivityMarker(busIcon, resistivity: Resistivity) {
    const marker_i = L.marker(
      new L.LatLng(resistivity.geometry['lat'], resistivity.geometry['lng']),
      { icon: busIcon, title: resistivity.reference }
    );

    let select_popup = '<h2> resistivity ' + resistivity.reference + "</h2><hr>";
    select_popup += '<button data-btn="detail" data-type="resistivities" data-id="'+resistivity.id+'" class="sp_button">Details<span class="detail_button_icon">></span></button></a>';
    select_popup += '<button data-btn="notes" data-type="resistivities" data-id="'+resistivity.id+'" class="sp_button">Notes<span class="detail_button_icon">></span></button>';
    select_popup += '<button data-btn="drive" data-type="resistivities" data-id="'+resistivity.id+'" class="sp_button">DriveTo<span class="detail_button_icon">></span></button>';

    const popup = L.popup({
      className: 'select_marker_popup',
      closeButton: false,
    }).setContent(select_popup);
    marker_i.bindPopup(popup);

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
