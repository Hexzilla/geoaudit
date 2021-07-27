import { Component, OnInit } from '@angular/core';
import { environment } from 'apps/geoaudit/src/environments/environment';
import { Observable } from 'rxjs';
import { UserEntityService } from '../../entity-services/user-entity.service';
import { User } from '../../models';
import { AuthService } from '../../services';

@Component({
  selector: 'geoaudit-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  API_URL: string;

  user$ = this.userEntityService.getByKey(this.authService.authValue.user.id);

  constructor(
    private authService: AuthService,
    private userEntityService: UserEntityService
  ) { 
    this.API_URL = environment.API_URL;
  }

  ngOnInit(): void {
  }

}
