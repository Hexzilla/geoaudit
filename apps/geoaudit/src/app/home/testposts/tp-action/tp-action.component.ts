import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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

  /**
   * Whether the form has been submitted.
   */
  submitted = false;

  testpostId = 0;

  actionId = 0;

  public tp_action: TpAction = null;

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

    this.fetchTpAction();
  }

  ngAfterViewInit(): void {
    //
  }

  getTestpostTitle() {
    const testpost = this.tp_action?.testpost
    if (testpost) {
      return `${testpost.reference} - ${testpost.name}`;
    }
    return 'Testpost';
  }

  fetchTpAction() {
    this.testpostId = this.route.snapshot.params['id']
    console.log("testpostId", this.testpostId)

    this.actionId = this.route.snapshot.params['actionId'];
    console.log("actionId", this.actionId)

    this.tpActionEntityService.getByKey(this.actionId).subscribe(
      (tp_action) => {
        this.tp_action = tp_action;

        const fault_detail = [
          {
            fault_type: "type1",
            fault_desc: "desc1"
          },
          {
            fault_type: "type2",
            fault_desc: "desc2"
          }
        ]/*.map(item => {
          return new FormGroup({
            fault_type: new FormControl(item.fault_type),
            fault_desc: new FormControl(item.fault_desc),
          })
        })*/
        console.log('fault_detail', fault_detail);

        if (tp_action) {
          this.form.patchValue({
            date: moment(tp_action.date).format('L LT'),
            condition: tp_action.condition?.name,

            images: tp_action.images,
            documents: tp_action.documents
          });

          fault_detail.map(item => {
            this.addFaults()
          })
          this.faults.setValue(fault_detail);
          console.log('this.faults', this.faults)
        }
      },
      (err) => {}
    )
  }

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
      others_reedswitch: null,
      others_refcell: null,
      cd_input_v: null,
      cd_input_a: null,
      cd_output_v: null,
      cd_output_a: null,
      asset_pipe_depth: null,
      asset_reinstatement: null,
      faults: new FormArray([
        /*new FormGroup({
          fault_type: new FormControl(''),
          fault_desc: new FormControl('')
        })*/
      ]),
      fault_desc: null,
    });
  }

  get faults(): FormArray {
    return this.form.get('faults') as FormArray;
  }

  addFaults() {
		const fg = this.formBuilder.group({
      fault_type: new FormControl(''),
      fault_desc: new FormControl('')
    });
		this.faults.push(fg);
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

  searchTestpost() {
    this.router.navigate([`/home/search`]);
  }

  updateMarkState(e) {
    if (e.complete) {
      //TODO: update action state to completed
    }
    else if (e.approve) {
      //TODO: update action state to approved
    }
    else if (e.refuse) {
      //TODO: update action state to refused
    }
  }
}
