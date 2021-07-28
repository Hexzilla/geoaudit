import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Auth, ForgotPassword, ResetPassword, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private authSubject: BehaviorSubject<Auth>;
    public auth: Observable<Auth>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.authSubject = new BehaviorSubject<Auth>(JSON.parse(localStorage.getItem('auth')));
        this.auth = this.authSubject.asObservable();
    }

    public get authValue(): Auth {
        return this.authSubject.value;
    }

    login(username, password) {
        return this.http.post<Auth>(`${environment.API_URL}/auth/local`, { identifier: username, password })
            .pipe(map(auth => {
                // store auth details and jwt token in local storage to keep auth logged in between page refreshes
                localStorage.setItem('auth', JSON.stringify(auth));
                this.authSubject.next(auth);
                return auth;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('auth');
        this.authSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    register(user: User) {
        return this.http.post(`${environment.API_URL}/users/register`, user);
    }

    getAll() {
        return this.http.get<User[]>(`${environment.API_URL}/users`);
    }

    getById(id: string) {
        return this.http.get<User>(`${environment.API_URL}/users/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.API_URL}/users/${id}`, params)
            .pipe(map(x => {
                // update stored auth if the logged in auth updated their own record
                if (id == this.authValue.user.id) {
                    // update local storage
                    const auth = { ...this.authValue, ...params };
                    localStorage.setItem('auth', JSON.stringify(auth));

                    // publish updated auth to subscribers
                    this.authSubject.next(auth);
                }
                return x;
            }));
    }

    delete(id: any) {
        return this.http.delete(`${environment.API_URL}/users/${id}`)
            .pipe(map(x => {
                // auto logout if the logged in user deleted their own record
                if (id == this.authValue.user.id) {
                    this.logout();
                }
                return x;
            }));
    }

    forgotPassword(data: ForgotPassword) {
        return this.http.post(`${environment.API_URL}/auth/forgot-password`, data);
    }
    
    resetPassword(data: ResetPassword) {
        return this.http.post(`${environment.API_URL}/auth/reset-password`, data);   
    }
}