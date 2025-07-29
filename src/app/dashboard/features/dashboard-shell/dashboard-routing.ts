import { Routes } from "@angular/router";
import { privateGuard } from "../../../services/guards/auth.guards";

export default [
{
    path: '',
    loadComponent: () => import('../dashboard-list/dashboard-list.component').then(m => m.default),
    canActivate: [privateGuard],
},
{
    path: 'almacen1',
    loadComponent: () => import('../dashboard-almacen/dashboard-almacen1/dashboard-almacen.component').then(m => m.DashboardAlmacenComponent),
    canActivate: [privateGuard],
},
{
    path: 'almacen2',
    loadComponent: () => import('../dashboard-almacen/dashboard-almacen2/dashboard-almacen2.component').then(m => m.DashboardAlmacen2Component),
    canActivate: [privateGuard],
},
{
    path: 'tareas',
    loadComponent: () => import('../dashboard-tareas/dashboard-tareas.component').then(m => m.DashboardTareasComponent),
    canActivate: [privateGuard],
},
{
    path: 'reportes',
    loadComponent: () => import('../dashboard-reportes/dashboard-reportes.component').then(m => m.DashboardReportesComponent),
    canActivate: [privateGuard],
},
{
    path: 'ventas',
    loadComponent: () => import('../dashboard-ventas/dashboard-ventas.component').then(m => m.DashboardVentasComponent),
    canActivate: [privateGuard],
},
{
    path: 'clientes',
    loadComponent: () => import('../dashboard-clientes/dashboard-clientes.component').then(m => m.DashboardClientesComponent),
    canActivate: [privateGuard],
},
{
    path: 'proveedores',
    loadComponent: () => import('../dashboard-proveedores/dashboard-proveedores.component').then(m => m.DashboardProveedoresComponent),
    canActivate: [privateGuard],
},
{
    path: 'profile',
    loadComponent: () => import('../menu-grid/menu-profile/menu-profile.component').then(m => m.MenuProfileComponent),
    canActivate: [privateGuard],
},
{
    path: '**',
    redirectTo: '',
}
] as Routes