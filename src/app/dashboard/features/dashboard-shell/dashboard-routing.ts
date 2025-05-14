import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('../dashboard-list/dashboard-list.component'),
    },
    {
        path:"**",
        redirectTo: '',
    }
] as Routes