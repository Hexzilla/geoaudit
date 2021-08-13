import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as MapActions from '../../../store/map/map.actions';
import * as fromApp from '../../../store';
import * as moment from 'moment';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { Testpost } from '../../../models';

@Component({
  selector: 'geoaudit-testpost',
  templateUrl: './testpost.component.html',
  styleUrls: ['./testpost.component.scss']
})
export class TestpostComponent implements OnInit, AfterViewInit {

  id: string;

  form: FormGroup;

  color: ThemePalette = 'primary';

  @ViewChild('dateInstallationDateTimePicker') dateInstallationDateTimePicker: any;

  @ViewChild('latCtrlInput') latCtrlInput: ElementRef;
  @ViewChild('lngCtrlInput') lngCtrlInput: ElementRef;

  latCtrl = new FormControl();

  lngCtrl = new FormControl();

  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public minDate: Date;
  public maxDate: Date;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public disableMinute = false;
  public hideTime = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private testpostEntityService: TestpostEntityService,
    private store: Store<fromApp.State>,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.initForm();

    if (this.id) {
      this.getTestpostAndPatchForm(this.id);
    } else {
      // this.createMode();
    }

    this.store.select('map').subscribe((map) => {
      if (map.clickMarker) {
        this.latCtrl.setValue(map.clickMarker.lat);
        this.lngCtrl.setValue(map.clickMarker.lng);
      }
    });
  }

  ngAfterViewInit() {
    this.latCtrl.valueChanges.subscribe((value) => {
      if (value) {
        this.form.patchValue({
          geometry: {
            ...this.form.value.geometry,
            lat: value,
          },
        });
      }
    });

    this.lngCtrl.valueChanges.subscribe((value) => {
      if (value) {
        this.form.patchValue({
          geometry: {
            ...this.form.value.geometry,
            lng: value,
          },
        });
      }
    });
  }

  initForm() {
    this.form = this.formBuilder.group({

      reference: [''],
      name: [''],
      date_installation: [moment().toISOString()],
      manufacture: [''],
      model: [''],
      serial_number: [''],

      geometry: [null],

      abrioxes: [[]],


      // datetime: moment().toISOString(),
      // description: null,
      // images: [[]],
      // attachments: [[]],

      // assignees: [],

      // abrioxes: [],
      // jobs: [],
      // resistivities: [],
      // sites: [],
      // surveys: [],
      // testposts: [],
      // trs: [],

      id: null, // Whilst we don't edit the id, we submit the form.
    });
  }

  getTestpostAndPatchForm(id: string) {
    this.testpostEntityService.getByKey(id).subscribe(
      (testpost) => {
        this.patchForm(testpost);

        // this.autoSave(true);
      },

      (err) => {}
    )
  }

  patchForm(testpost: Testpost) {
    const {
      id,

      reference,
      name,
      date_installation,
      manufacture,
      model,
      serial_number,
      geometry
    } = testpost;

    console.log('geometry', geometry)

    this.form.patchValue({
      id,

      reference,
      name,
      date_installation,
      manufacture,
      model,
      serial_number,
      geometry
    })

    this.latCtrl.setValue(geometry?.lat);
    this.lngCtrl.setValue(geometry?.lng);
  }

  clickMarker(): void {
    this.store.dispatch(
      MapActions.toggleSidebar({
        url: this.router.url,
      })
    );
  }

}
