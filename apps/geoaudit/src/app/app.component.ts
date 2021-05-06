import { Component } from '@angular/core';
import { Auth } from './models';
import { AuthService } from './services';

@Component({
  selector: 'geoaudit-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  auth: Auth;

  constructor(private authService: AuthService) {
      this.authService.auth.subscribe(x => this.auth = x);
  }

  logout() {
      this.authService.logout();
  }
}
