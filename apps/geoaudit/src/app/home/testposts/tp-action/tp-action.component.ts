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
            type: "type1",
            desc: "desc1"
          },
          {
            type: "type2",
            desc: "desc2"
          }
        ]
        console.log('fault_detail', fault_detail);

        //TODO - FormArray
        if (tp_action) {
          this.form.patchValue({
            date: moment(tp_action.date).format('L LT'),
            condition: tp_action.condition?.name,

            images: tp_action.images,
            documents: tp_action.documents
          });

          this.faults.clear();
          fault_detail.map(item => this.addFaults(item));
          console.log('this.faults', this.faults)
        }
      },
      (err) => {}
    )
  }

  get anodes(): FormArray {
    return this.form.get('anodes') as FormArray;
  }

  addAnode(anode) {
    if (anode) {
		  this.anodes.push(this.formBuilder.group(anode));
    } else {
      this.anodes.push(this.formBuilder.group({
        anodes_on: '',
        anodes_off: '',
        anodes_current: '',
      }));
    }
  }

  get deads(): FormArray {
    return this.form.get('deads') as FormArray;
  }

  addDead(item) {
    if (item) {
		  this.deads.push(this.formBuilder.group(item));
    } else {
      this.deads.push(this.formBuilder.group({
        dead_on: '',
        dead_off: '',
        dead_current: '',
      }));
    }
  }

  get sleeves(): FormArray {
    return this.form.get('sleeves') as FormArray;
  }

  addSleeve(item) {
    if (item) {
		  this.sleeves.push(this.formBuilder.group(item));
    } else {
      this.sleeves.push(this.formBuilder.group({
        sleeve_on: '',
        sleeve_off: '',
        sleeve_current: '',
      }));
    }
  }

  get coupons(): FormArray {
    return this.form.get('coupons') as FormArray;
  }

  addCoupon(item) {
    if (item) {
		  this.coupons.push(this.formBuilder.group(item));
    } else {
      this.coupons.push(this.formBuilder.group({
        coupon_on: '',
        coupon_off: '',
        coupon_current_ac: '',
        coupon_current_dc: '',
      }));
    }
  }

  get currentDrains(): FormArray {
    return this.form.get('currentDrains') as FormArray;
  }

  addCurrentDrain(drain) {
    if (drain) {
		  this.currentDrains.push(this.formBuilder.group(drain));
    } else {
      this.currentDrains.push(this.formBuilder.group({
        cd_input_v: '',
        cd_input_a: '',
        cd_output_v: '',
        cd_output_a: ''
      }));
    }
  }

  get assets(): FormArray {
    return this.form.get('assets') as FormArray;
  }

  addAssets(asset) {
    if (asset) {
		  this.assets.push(this.formBuilder.group(asset));
    } else {
      this.assets.push(this.formBuilder.group({
        pipe_depth: '',
        reinstatement: ''
      }));
    }
  }

  get faults(): FormArray {
    return this.form.get('faults') as FormArray;
  }

  addFaults(fault) {
    if (fault) {
		  this.faults.push(this.formBuilder.group(fault));
    } else {
      this.faults.push(this.formBuilder.group({
        type: '',
        desc: ''
      }));
    }
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
      anodes: new FormArray([]),
      deads: new FormArray([]),
      sleeves: new FormArray([]),
      coupons: new FormArray([]),
      others_reedswitch: null,
      others_refcell: null,
      currentDrains: new FormArray([]),
      assets: new FormArray([]),
      faults: new FormArray([]),
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
