import { Routes } from "@angular/router";

export default [
{
    path: '',
    loadComponent: () => import('../dashboard-list/dashboard-list.component').then(m => m.default),
},
{
    path: 'almacen1',
    loadComponent: () => import('../dashboard-almacen/dashboard-almacen1/dashboard-almacen.component').then(m => m.DashboardAlmacenComponent),
},
{
    path: 'almacen2',
    loadComponent: () => import('../dashboard-almacen/dashboard-almacen2/dashboard-almacen2.component').then(m => m.DashboardAlmacen2Component),
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
    path: 'clientes',
    loadComponent: () => import('../dashboard-clientes/dashboard-clientes.component').then(m => m.DashboardClientesComponent),
},
{
    path: 'proveedores',
    loadComponent: () => import('../dashboard-proveedores/dashboard-proveedores.component').then(m => m.DashboardProveedoresComponent)
},
{
    path: 'profile',
    loadComponent: () => import('../menu-grid/menu-profile/menu-profile.component').then(m => m.MenuProfileComponent)
},
{
    path: '**',
    redirectTo: '',
}
] as Routes