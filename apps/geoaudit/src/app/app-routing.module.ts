import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './guards';

const homeModule = () => import('./home/home.module').then(x => x.HomeModule);
const authModule = () => import('./auth/auth.module').then(x => x.AuthModule);
const usersModule = () => import('./users/users.module').then(x => x.UsersModule);

const routes: Routes = [
    { path: 'home', loadChildren: homeModule, canActivate: [AuthGuard] },
    { path: 'users', loadChildren: usersModule, canActivate: [AuthGuard] },
    { path: 'auth', loadChildren: authModule },

    {path: '', redirectTo:'/home', pathMatch: 'full' },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }