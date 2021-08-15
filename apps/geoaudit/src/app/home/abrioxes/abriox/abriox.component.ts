import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  debounceTime,
  tap,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import { AbrioxEntityService } from '../../../entity-services/abriox-entity.service';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { TrEntityService } from '../../../entity-services/tr-entity.service';
import { Abriox } from '../../../models';
import { AlertService, AuthService, UploadService } from '../../../services';

@Component({
  selector: 'geoaudit-abriox',
  templateUrl: './abriox.component.html',
  styleUrls: ['./abriox.component.scss'],
})
export class AbrioxComponent implements OnInit {
  id: string;

  form: FormGroup;

  color: ThemePalette = 'primary';

  @ViewChild('dateInstallationDateTimePicker') dateInstallationDateTimePicker: any;

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

  private unsubscribe = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private abrioxEntityService: AbrioxEntityService,
    private testpostEntityService: TestpostEntityService,
    private trEntityService: TrEntityService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private router: Router,
    private uploadService: UploadService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.initForm();

    if (this.id) {
      this.getAbrioxAndPatchForm(this.id);
    } else {
      this.createMode();
    }
  }

  initForm() {
    this.form = this.formBuilder.group({
      name: null,

      testpost: null,
      tr: null,

      serial_number: null,
      telephone: null,
      date_installation: null,
      condition: null,
      status: null,

      footer: [
        {
          images: [],
          documents: [],
        },
      ],

      id: null,
    });
  }

  getAbrioxAndPatchForm(id: string) {
    this.abrioxEntityService.getByKey(id).subscribe(
      (abriox) => {
        this.patchForm(abriox);
      },

      (err) => {}
    );
  }

  createMode() {
    this.abrioxEntityService.add(this.form.value).subscribe(
      (abriox) => {
        console.log('t', abriox);
        this.patchForm(abriox);
      },

      (err) => {}
    );
  }

  patchForm(abriox: Abriox) {
    const {
      id,

      name,

      testpost,
      tr,

      serial_number,
      telephone,
      date_installation,
      condition,
      footer,
      status
    } = abriox;

    this.form.patchValue({
      id,

      name,

      testpost: testpost?.id,
      tr: tr?.id,

      serial_number,
      telephone,
      date_installation,
      condition: condition?.id,
      status: status?.id,

      footer: footer
        ? footer
        : {
            images: [],
            documents: [],
          },
    });

    const testpostId = this.route.snapshot.queryParamMap.get('testpost');

    if (testpostId) {
      this.testpostEntityService.getByKey(testpostId).subscribe((item) => {
        this.form.patchValue({
          testpost: item,
        });
      });
    }

    const trId = this.route.snapshot.queryParamMap.get('tr');

    if (trId) {
      this.trEntityService.getByKey(trId).subscribe((item) => {
        this.form.patchValue({
          tr: item,
        });
      });
    }

    this.autoSave(this.id ? false : true);
  }

  autoSave(reload = false) {
    this.form.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {
          this.submit(false);
        }),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe)
      )
      .subscribe(() => {
        /**
         * Workaround.
         *
         * When we navigate to the create a note component. We may have
         * provided a jobs query parameter. However the jobs selector is not
         * updated with that and therefore we're reloading such that it
         * goes into edit mode.
         */
        if (reload) {
          this.router
            .navigate([`/home/abrioxes/${this.form.value.id}`])
            .then(() => {
              window.location.reload();
            });
        }
      });
  }

  submit(navigate = true) {
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
    this.abrioxEntityService.update(this.form.value).subscribe(
      (update) => {
        this.alertService.info('Saved Changes');

        if (navigate) this.router.navigate([`/home/abrioxes`]);
      },

      (err) => {
        this.alertService.error('Something went wrong');
      },

      () => {}
    );
  }

  onItemChange(item: any, attribute: string): void {
    this.form.patchValue({
      [attribute]: item ? item.id : null
    });
  }
}
