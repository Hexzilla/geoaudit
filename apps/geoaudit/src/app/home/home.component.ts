import { Component, OnInit } from '@angular/core';

import { Auth } from '../models';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'geoaudit-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  auth: Auth;

  constructor(
    private authService: AuthService
  ) {
    this.auth = this.authService.authValue;
  }

  ngOnInit(): void {
  }

}
