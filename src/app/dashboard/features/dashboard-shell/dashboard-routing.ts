import { Routes } from "@angular/router";

export default [
{
    path: '',
    loadComponent: () => import('../dashboard-list/dashboard-list.component').then(m => m.default),
},
{
    path: 'almacen',
    loadComponent: () => import('../dashboard-almacen/dashboard-almacen.component').then(m => m.DashboardAlmacenComponent),
},
{
    path: 'tareas',
    loadComponent: () => import('../dashboard-tareas/dashboard-tareas.component').then(m => m.DashboardTareasComponent),
},
{
    path: 'reportes',
    loadComponent: () => import('../dashboard-reportes/dashboard-reportes.component').then(m => m.DashboardReportesComponent),
},
{
    path: 'ventas',
    loadComponent: () => import('../dashboard-ventas/dashboard-ventas.component').then(m => m.DashboardVentasComponent),
},
{
    path: '**',
    redirectTo: '',
}
] as Routes