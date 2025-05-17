import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: '',
    loadChildren: () => import('./dashboard/features/dashboard-shell/dashboard-routing')
},
];