import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:"auth",
        loadChildren: () => import('./auth/features/auth-shell/auth-routing'),
    },
];
