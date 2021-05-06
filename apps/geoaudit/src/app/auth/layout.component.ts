import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services';

@Component({ templateUrl: 'layout.component.html', styleUrls: ['./layout.component.scss'] })
export class LayoutComponent {
    constructor(
        private router: Router,
        private authService: AuthService
    ) {
        // redirect to home if already logged in
        if (this.authService.authValue) {
            this.router.navigate(['/']);
        }
    }
}