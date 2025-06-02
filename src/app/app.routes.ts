import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './services/guards/auth.guards';

export const routes: Routes = [
{
    path: '',
    redirectTo: 'auth/log-in',
    pathMatch: 'full'
},
{
    path: 'auth/log-in',
    loadComponent: () => import('./auth/features/auth-log-in/auth-log-in.component').then(m => m.default),
    data: { animation: 'LogInPage' },
    canActivate: [publicGuard],
},
{
    path: 'auth/sign-up',
    loadComponent: () => import('./auth/features/auth-sign-up/auth-sign-up.component').then(m => m.default),
    data: { animation: 'SignUpPage' },
    canActivate: [publicGuard],
},
{
    path: 'dashboard',
    loadChildren: () => import('./dashboard/features/dashboard-shell/dashboard-routing')
},
];