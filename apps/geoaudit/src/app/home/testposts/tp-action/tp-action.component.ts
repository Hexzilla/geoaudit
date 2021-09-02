import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as MapActions from '../../../store/map/map.actions';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import {
  Abriox,
  Conditions,
  Image,
  MarkerColours,
  Survey,
  Testpost,
  TpAction,
  Status,
} from '../../../models';
import {
  debounceTime,
  tap,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AlertService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { AttachmentModalComponent } from '../../../modals/attachment-modal/attachment-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';

@Component({
  selector: 'geoaudit-tp-action',
  templateUrl: './tp-action.component.html',
  styleUrls: ['./tp-action.component.scss'],
})
export class TpActionComponent implements OnInit, AfterViewInit {
  /**
   * The form consisting of the form fields.
   */
  form: FormGroup;

  /**
   * An array of status i.e. NOT_STARTED, ONGOING, etc.
   */
  statuses: Array<Status>;

  /**
   * The current job state.
   */
  currentState = 0;

  public selectedTabIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private surveyEntityService: SurveyEntityService,
    private testpostEntityService: TestpostEntityService,
    private tpActionEntityService: TpActionEntityService,
    private store: Store<fromApp.State>,
    private router: Router,
    private alertService: AlertService,
    private _lightbox: Lightbox,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    /**
     * Initialise the form with properties and validation
     * constraints.
     */
    this.initialiseForm();
  }

  ngAfterViewInit(): void {}

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      date: null,
      condition: null,
      pipe_on: null,
      pipe_off: null,
      anodes_on: null,
      anodes_off: null,
      anodes_current: null,
      dead_on: null,
      dead_off: null,
      dead_current: null,
      sleeve_on: null,
      sleeve_off: null,
      sleeve_current: null,
      coupon_on: null,
      coupon_off: null,
      coupon_current_ac: null,
      coupon_current_dc: null,
      cd_input_v: null,
      cd_input_a: null,
      cd_output_v: null,
      cd_output_a: null,
      asset_pipe_depth: null,
      asset_reinstatement: null,
      fault_type: null,
      fault_desc: null,
    });
  }

  submit() {
    console.log("submit")
  }

  selectedIndexChange(selectedTabIndex) {
    this.selectedTabIndex = selectedTabIndex;
  }
}
