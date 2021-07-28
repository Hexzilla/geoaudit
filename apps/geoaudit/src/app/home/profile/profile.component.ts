import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { combineLatest, noop, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserEntityService } from '../../entity-services/user-entity.service';
import { User } from '../../models';
import { AlertService, AuthService } from '../../services';

@Component({
  selector: 'geoaudit-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  step = null;

  API_URL: string;

  changeUsernameForm: FormGroup;

  changePasswordForm: FormGroup;

  user$ = this.userEntityService.getByKey(this.authService.authValue.user.id);

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private userEntityService: UserEntityService
  ) {
    this.API_URL = environment.API_URL;
  }

  ngOnInit(): void {
    this.changeUsernameForm = this.formBuilder.group({
      username: ['', Validators.required],
    });

    this.changePasswordForm = this.formBuilder.group({
      code: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirmation: ['', Validators.required]
    })

    this.user$
      .pipe(
        map((user) => {
          this.changeUsernameForm.patchValue({
            username: user.username,
          });
        })
      )
      .subscribe();
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  saveUsername() {
    this.user$
      .pipe(
        map((user) => {
          this.userEntityService
            .update({
              id: user.id,
              username: this.changeUsernameForm.value.username,
            })
            .pipe(
              tap(
                () => {
                  this.refreshUser();
                },
                (err) => {
                  this.alertService.error(err.error[0].messages[0].message);
                }
              )
            )
            .subscribe();
        })
      )
      .subscribe();
  }

  refreshUser() {
    this.user$ = this.userEntityService.getByKey(
      this.authService.authValue.user.id
    );
  }

  updatePassword() {
    this.authService.forgotPassword({
      email: this.authService.authValue.user.email,
      // url: `${this.API_URL}/admin/plugins/users-permissions/auth/reset-password`
    }).subscribe((res) => {
      console.log('res', res)
    })
  }

  resetPassword() {
    this.authService.resetPassword({
      code: this.changePasswordForm.value.code,
      password: this.changePasswordForm.value.password,
      passwordConfirmation: this.changePasswordForm.value.passwordConfirmation
    }).subscribe((res) => {
      console.log('res', res)
    })
  }
}
