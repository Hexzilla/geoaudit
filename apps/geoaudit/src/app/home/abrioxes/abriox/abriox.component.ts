import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, tap, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AbrioxEntityService } from '../../../entity-services/abriox-entity.service';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { Abriox } from '../../../models';
import { AlertService, AuthService, UploadService } from '../../../services';

@Component({
  selector: 'geoaudit-abriox',
  templateUrl: './abriox.component.html',
  styleUrls: ['./abriox.component.scss']
})
export class AbrioxComponent implements OnInit {

  id: string;

  form: FormGroup;

  private unsubscribe = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private abrioxEntityService: AbrioxEntityService,
    private testpostEntityService: TestpostEntityService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private router: Router,
    private uploadService: UploadService,
    private authService: AuthService
  ) { }

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
      testpost: null,
      tr: null,
      serial_number: null,
      telephone: null,
      date_installation: null,
      condition: null,

      footer: [{
        images: [],
        documents: []
      }],

      id: null
    })
  }

  getAbrioxAndPatchForm(id: string) {
    this.abrioxEntityService.getByKey(id).subscribe(
      (note) => {
        this.patchForm(note);
      },

      (err) => {}
    );
  }

  createMode() {
    this.abrioxEntityService.add(this.form.value).subscribe(
      (abriox) => {
        console.log('t', abriox)
        this.patchForm(abriox);
      },

      (err) => {}
    )
  }

  patchForm(abriox: Abriox) {
    const {
      id,

      testpost,
      tr,
      serial_number,
      telephone,
      date_installation,
      condition,
      footer,
    } = abriox;

    this.form.patchValue({
      id,

      testpost,
      tr,
      serial_number,
      telephone,
      date_installation,
      condition,
      
      footer: footer
      ? footer
      : {
          images: [],
          documents: [],
        },
    })

    const testpostId = this.route.snapshot.queryParamMap.get('testpost');

    if (testpostId) {
      this.testpostEntityService.getByKey(testpostId).subscribe(item => {
        console.log('item', item)
        this.form.patchValue({
          testpost: item
        })
      })
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
}
