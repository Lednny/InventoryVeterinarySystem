import { Routes } from '@angular/router';

export const routes: Routes = [
{
    path: '',
    redirectTo: 'auth/log-in',
    pathMatch: 'full'
},
{
    path: 'auth/log-in',
    loadComponent: () => import('./auth/features/auth-log-in/auth-log-in.component').then(m => m.default),
    data: { animation: 'LogInPage' }
},
{
    path: 'auth/sign-up',
    loadComponent: () => import('./auth/features/auth-sign-up/auth-sign-up.component').then(m => m.default),
    data: { animation: 'SignUpPage' }
},
{
    path: 'dashboard',
    loadChildren: () => import('./dashboard/features/dashboard-shell/dashboard-routing')
},
];