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
  TrAction,
  Status,
} from '../../../models';
import {
  debounceTime,
  tap,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';
import { AlertService } from '../../../services';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { AttachmentModalComponent } from '../../../modals/attachment-modal/attachment-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';

@Component({
  selector: 'geoaudit-tp-action',
  templateUrl: './tr-action.component.html',
  styleUrls: ['./tr-action.component.scss'],
})
export class TrActionComponent implements OnInit, AfterViewInit {
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

  /**
   * Whether the form has been submitted.
   */
  submitted = false;

  public tr_action: TrAction = null;

  public selectedTabIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private surveyEntityService: SurveyEntityService,
    private testpostEntityService: TestpostEntityService,
    private statusEntityService: StatusEntityService,
    private tpActionEntityService: TpActionEntityService,
    private store: Store<fromApp.State>,
    private router: Router,
    private alertService: AlertService,
    private _lightbox: Lightbox,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Fetch statuses
    this.statusEntityService.getAll().subscribe(
      (statuses) => {
        this.statuses = statuses;
      },
      (err) => {}
    );

    /**
     * Initialise the form with properties and validation
     * constraints.
     */
    this.initialiseForm();
  }

  ngAfterViewInit(): void {
  }

  /**
   * Initialisation of the form, properties, and validation.
   */
  initialiseForm(): void {
    this.form = this.formBuilder.group({
      date: null,
      condition: null,
      reading_volt: null,
      reading_amps: null,
      current_setting: null,
      anodes_off: null,
      anodes_current: null,
      cd_input_v: null,
      cd_input_a: null,
      cd_output_v: null,
      cd_output_a: null,
      fault_type: null,
      fault_desc: null,
    });
  }

  submit(navigate = true) {
    console.log('submit');
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
      this.alertService.error('Invalid');
      return;
    }

    /**
     * Invoke the backend with a PUT request to update
     * the job with the form values.
     *
     * If create then navigate to the job id.
     */
    /*this.jobEntityService.update(this.form.value).subscribe(
      (update) => {
        this.alertService.info('Saved Changes');

        this.dataSource = new MatTableDataSource(update.surveys);

        if (navigate) this.router.navigate([`/home/jobs`]);
      },

      (err) => {
        this.alertService.error('Something went wrong');
      }
    );*/
  }

  selectedIndexChange(selectedTabIndex) {
    this.selectedTabIndex = selectedTabIndex;
  }
}
