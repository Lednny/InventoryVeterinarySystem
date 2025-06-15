import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { AfterViewInit} from '@angular/core';
import { InventarioService } from '../../../services/inventario.service';
import Chart from 'chart.js/auto';
@Component({
  selector: 'app-dashboard-list',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './dashboard-list.component.html',
  styles: ``
})
export default class DashboardListComponent implements OnInit , AfterViewInit {
  @ViewChild('notificacionesDropdown') notificacionesDropdown!: ElementRef;
  @ViewChild('notificacionesBtn') notificacionesBtn!: ElementRef;
  @ViewChild('menuGridDropdown') menuGridDropdown!: ElementRef;
  @ViewChild('menuGridBtn') menuGridBtn!: ElementRef;
  @ViewChild('UserDropdown') UserDropdown!: ElementRef;
  @ViewChild('UserBtn') UserBtn!: ElementRef;
  //Varriables para Funcionalidades de la aplicación
  
  // Variables para las operaciones CRUD de tareas

  userId: string = '';
  private supabaseClient = inject(SupabaseService).supabaseClient;

  
  // Variables para el avatar del usuario
  avatarUrl: string = '';
  firstName = '';
  email = '';

    //Variables para Dropdown de botones de Notificaciones y GRID
  mostrarNotificaciones = false;
  mostrarMenuGrid = false;
  mostrarUserDropdown = false;

  // Variables para lasalertas y notificaciones
  notificaciones: any[] = [];
  notificaciones1: any[] = [];
  supabase: any[] = [];

    constructor(
    private router: Router,
    private authService: AuthService,
    private inventarioService: InventarioService
  ) {}

async ngOnInit() {
  const session = await this.authService.session();
  const user = session.data.session?.user;
  if (!user) {
    console.error('No se encontró el usuario en la sesión');
    window.location.href = '/auth/log-in';
    return;
  }

    // Usa el método ensureUsuario
    const data = await this.ensureUsuario(user);

    // Asigna los datos a las variables del componente
    if (data) {
      this.userId = data.user_id;
      this.firstName = data.nombre || '';
      this.email = data.email || '';
      this.avatarUrl = data.avatar_url || '';
    }

try {
    // Obtén productos de ambos almacenes
    const almacen1 = await this.inventarioService.getProductos();
    const almacen2 = await this.inventarioService.getProductosAlmacen2();

    // Genera alertas para ambos almacenes
    const alertasAlmacen1 = this.getAlertasPorTiempo(almacen1);
    const alertasAlmacen2 = this.getAlertasPorTiempo(almacen2);

    // Une ambos arrays de notificaciones
    this.notificaciones = [...alertasAlmacen1, ...alertasAlmacen2];
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

  // Método para asegurar que el usuario existe en la base de datos
  private async ensureUsuario(user: any): Promise<any> {
    let { data } = await this.supabaseClient
      .from('usuarios')
      .select('user_id, nombre, email, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (!data) {
      await this.supabaseClient
        .from('usuarios')
        .insert([{
          user_id: user.id,
          nombre: user.user_metadata?.['nombre'] || '',
          email: user.email,
          avatar_url: user.user_metadata?.['avatar_url'] || ''
        }]);
      // Espera a que el registro esté disponible
      let retry = 0;
      while (!data && retry < 5) {
        await new Promise(res => setTimeout(res, 300));
        const result = await this.supabaseClient
          .from('usuarios')
          .select('user_id, nombre, email, avatar_url')
          .eq('user_id', user.id)
          .single();
        data = result.data;
        retry++;
      }
    }
    return data;
  }

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  // Notificaciones
  const notificacionesDropdown = this.notificacionesDropdown?.nativeElement;
  const notificacionesBtn = this.notificacionesBtn?.nativeElement;
  if (
    this.mostrarNotificaciones &&
    notificacionesDropdown && notificacionesBtn &&
    !notificacionesDropdown.contains(event.target) &&
    !notificacionesBtn.contains(event.target)
  ) {
    this.mostrarNotificaciones = false;
  }

  // Menu Grid
  const menuGridDropdown = this.menuGridDropdown?.nativeElement;
  const menuGridBtn = this.menuGridBtn?.nativeElement;
  if (
    this.mostrarMenuGrid &&
    menuGridDropdown && menuGridBtn &&
    !menuGridDropdown.contains(event.target) &&
    !menuGridBtn.contains(event.target)
  ) {
    this.mostrarMenuGrid = false;
  }
  
    // User Dropdown
  const userDropdown = this.UserDropdown?.nativeElement;
  const userBtn = this.UserBtn?.nativeElement;
  if (
    this.mostrarUserDropdown &&
    userDropdown && userBtn &&
    !userDropdown.contains(event.target) &&
    !userBtn.contains(event.target)
  ) {
    this.mostrarUserDropdown = false;
  }
}

async signOut() {
  await this.authService.signOut();
  window.location.href = '/auth/log-in'; // Fuerza recarga y navegación limpia
}

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  toggleMenuGrid() {
    this.mostrarMenuGrid = !this.mostrarMenuGrid;
    this.mostrarNotificaciones = false; // Cierra el menú del GRID si estaba abierto
  }

    toggleDropdownUser() {
    this.mostrarUserDropdown = !this.mostrarUserDropdown;
  }

    // Recarga la página para reflejar los cambios en el perfil
    recargarPagina() {
      window.location.reload();
    }

    getAlertasPorTiempo(productos: any[]): any[] {
  const hoy = new Date();
  return productos.map(producto => {
    const fechaIngreso = new Date(producto.fecha_ingreso);
    const meses = (hoy.getFullYear() - fechaIngreso.getFullYear()) * 12 + (hoy.getMonth() - fechaIngreso.getMonth());
    if (meses >= 6) {
      return {
        alerta: 'roja',
        mensaje: `¡ALERTA! El producto "${producto.producto}" con codigo de producto "${producto.codigo}" lleva más de 6 meses sin venderse`,
        producto
      };
    } else if (meses >= 3) {
      return {
        alerta: 'amarilla',
        mensaje: `¡Alerta! El producto "${producto.producto}" con codigo de producto "${producto.codigo}" lleva más de 3 meses sin venderse.`,
        producto
      };
    }
    return null;
  }).filter(Boolean);
}

    getAlertas1PorTiempo(productos: any[]): any[] {
  const hoy = new Date();
  return productos.map(producto => {
    const fechaIngreso = new Date(producto.fecha_ingreso);
    const meses = (hoy.getFullYear() - fechaIngreso.getFullYear()) * 12 + (hoy.getMonth() - fechaIngreso.getMonth());
    if (meses >= 6) {
      return {
        alerta: 'roja',
        mensaje1: `¡ALERTA! El producto "${producto.producto}" con codigo de producto "${producto.codigo}" lleva más de 6 meses sin venderse`,
        producto
      };
    } else if (meses >= 3) {
      return {
        alerta: 'amarilla',
        mensaje1: `¡Alerta! El producto "${producto.producto}" con codigo de producto "${producto.codigo}" lleva más de 3 meses sin venderse.`,
        producto
      };
    }
    return null;
  }).filter(Boolean);
}

      ngAfterViewInit() {
    new Chart('salesAreaChart', {
      type: 'line',
      data: {
        labels: ['01 Feb', '02 Feb', '03 Feb', '04 Feb', '05 Feb', '06 Feb', '07 Feb'],
        datasets: [{
          label: 'Revenue',
          data: [6300, 6200, 6250, 6550, 6356, 6200, 6050],
          fill: true,
          backgroundColor: 'rgba(6, 182, 212, 0.2)', 
          borderColor: '#06b6d4', 
          tension: 0.4,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#fff',
          pointRadius: 5,
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` Revenue: $${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          },
          y: {
            beginAtZero: false,
            ticks: { color: '#94a3b8' },
            grid: { color: '#334155' }
          }
        }
      }
    });
  }
}

