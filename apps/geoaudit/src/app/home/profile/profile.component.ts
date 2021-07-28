import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { combineLatest, noop, Observable, of } from 'rxjs';
import { MapsAPILoader } from '@agm/core';
import { catchError, map, tap } from 'rxjs/operators';
import { UserEntityService } from '../../entity-services/user-entity.service';
import { Auth, User } from '../../models';
import { AlertService, AuthService } from '../../services';

@Component({
  selector: 'geoaudit-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, AfterViewInit {

  step = null;

  API_URL: string;

  changeUsernameForm: FormGroup;

  changePasswordForm: FormGroup;

  changePasswordStep = null;

  changeAddressStep = null;

  changeAddressForm: FormGroup;

  geometry: {
    lat: number,
    lng: number
  }

  user$ = this.userEntityService.getByKey(this.authService.authValue.user.id);
  
  homeAddressSearchCtrl = new FormControl();

  @ViewChild('homeAddressSearchInput') homeAddressSearchInput: ElementRef;

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private userEntityService: UserEntityService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
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

    this.changeAddressForm = this.formBuilder.group({
      home: null,
      work: null
    })

    this.user$
      .pipe(
        map((user) => {

          // const latlng = new google.maps.LatLng(user.home.lat, user.home.lng)

          // console.log('latlng', latlng)

          this.mapsAPILoader.load().then(() => {

          this.ngZone.run(() => {
            const latlng = new google.maps.LatLng(user.home.lat, user.home.lng)

            const geocoder = new google.maps.Geocoder();
  
            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status !== google.maps.GeocoderStatus.OK) {
                alert(status);
            }
            // This is checking to see if the Geoeode Status is OK before proceeding
            if (status == google.maps.GeocoderStatus.OK) {
                console.log(results);
                var address = (results[0].formatted_address);

                console.log('address', address)
  
                this.changeAddressForm.patchValue({
                  home: address
                })

                this.homeAddressSearchCtrl.patchValue(address)
              }
            })
          })
          })

          this.changeUsernameForm.patchValue({
            username: user.username,
          });
        })
      )
      .subscribe();
  }

  ngAfterViewInit() {

    this.homeAddressSearchCtrl.valueChanges.subscribe((value) => {
      const place = this.place(this.homeAddressSearchInput, 'home');

      console.log('place', place, this.geometry)
    })
  }

  place(input: ElementRef, attribute: 'home' | 'work') {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        input.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          const geometry = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }
          
          this.geometry = geometry;
          
          this.updateUser({
            id: this.authService.authValue.user.id,
            [attribute]: geometry
          })
        });
      });
    });
  }

  setStep(index: number, accordion: 'CHANGE_PASSWORD' | 'CHANGE_ADDRESS') {
    switch (accordion) {
      case 'CHANGE_PASSWORD':
        this.changePasswordStep = index;
      break;

      case 'CHANGE_ADDRESS':
        this.changeAddressStep = index;
      break;
    }
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  saveUsername() {
    this.updateUser({
      id: this.authService.authValue.user.id,
      username: this.changeUsernameForm.value.username,
    })
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
      
      /**
       * Changes the current step of the panel process to the next one i..e enter code, password, confirmation password.
       */
      this.changePasswordStep++;
    })
  }

  resetPassword() {
    this.authService.resetPassword({
      code: this.changePasswordForm.value.code,
      password: this.changePasswordForm.value.password,
      passwordConfirmation: this.changePasswordForm.value.passwordConfirmation
    }).subscribe((auth: Auth) => {
      this.authService.setAuthSubject(auth);
      this.changePasswordStep = null;
    })
  }

  onImageUpload(event): void {        
    this.updateUser({
      id: this.authService.authValue.user.id,
      avatar: event
    })
  }

  updateUser(data: any) {
    this.userEntityService
    .update(data)
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
  }

  logout() {
    this.authService.logout();
  }
}
