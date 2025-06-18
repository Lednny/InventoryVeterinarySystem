import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { VentasService } from '../../../services/ventas.services';
import { AuthService } from '../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-ventas',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './dashboard-ventas.component.html',
  styles: ``
})
export class DashboardVentasComponent implements OnInit, OnDestroy {
  @ViewChild('notificacionesDropdown') notificacionesDropdown!: ElementRef;
  @ViewChild('notificacionesBtn') notificacionesBtn!: ElementRef;
  @ViewChild('menuGridDropdown') menuGridDropdown!: ElementRef;
  @ViewChild('menuGridBtn') menuGridBtn!: ElementRef;
  @ViewChild('actionsDropdown') actionsDropdown!: ElementRef;
  @ViewChild('actionsBtn') actionsBtn!: ElementRef;
  @ViewChild('UserDropdown') UserDropdown!: ElementRef;
  @ViewChild('UserBtn') UserBtn!: ElementRef;
  //Varriables para Funcionalidades de la aplicación
  
  // Variables para las operaciones CRUD de tareas
  ventas: any[] = [];
  private ventasSub!: Subscription;
  userId: string = '';
  showDropdown = false;
  private supabaseClient = inject(SupabaseService).supabaseClient;
  mostrarModalEliminar = false;
  ventasEliminar: number | null = null;
  ventasActualizar: any = null;

  //Variables para función de botón de Acciones
  mostrarModalActualizar = false;
  mostrarModalEdicionMasiva = false;
  ventasEdicionMasiva: any[] = [];
  mostrarModalEliminarTodas = false;
  mostrarDropdownActions = false;

  // Variables para el avatar del usuario
  avatarUrl: string = '';
  firstName = '';
  email = '';
  mostrarUserDropdown = false;


  //Variables para Dropdown de botones de Notificaciones y GRID
  mostrarNotificaciones = false;
  mostrarMenuGrid = false;

  //Variables para la paginación 
  currentPage: number = 1;
  itemsPerPage: number = 15;

  //Motoro de búsqueda
  searchTerm: string = '';
  resultadosBusqueda: null | any[] = null;

  constructor(
    private ventasService: VentasService,
    private router: Router,
    private authService: AuthService
  ) {}

  

  async ngOnInit() {
    await this.ensureUsuario();
    await this.init();
    await this.cargarDatosUsuario();
    this.cargarVentas();
    this.ventasSub = this.ventasService.ventasActualizadas$.subscribe(() => {
    this.cargarVentas();
    });
  }

    ngOnDestroy() {
    if (this.ventasSub) this.ventasSub.unsubscribe();
  }

  // Asegura que el usuario exista en la tabla 'usuarios'
  private async ensureUsuario() {
    const session = await this.authService.session();
    const user = session.data.session?.user;
    if (!user) return;

    // Verifica si el usuario ya existe en la tabla usuarios
    const { data } = await this.supabaseClient
      .from('usuarios')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (!data) {
      // Si no existe, lo insertas
      await this.supabaseClient
        .from('usuarios')
        .insert([{
          user_id: user.id,
          nombre: user.user_metadata?.['nombre'] || '',
          email: user.email,
          avatar_url: user.user_metadata?.['avatar_url'] || ''
        }]);
    }
  }

  private async init() {
    try {
      const session = await this.authService.session();
      const user_id = session.data.session?.user?.id;
      if (!user_id) {
        console.error('No hay usuario autenticado');
        // Aquí podrías redirigir al login si lo deseas
        return;
      }
      this.userId = user_id;
      await this.cargarVentas();
    } catch (error) {
      console.error('Error al obtener la sesión:', error);
    }
  }

async cargarVentas() {
  try {
    this.ventas = await this.ventasService.getTodasLasVentas();
  } catch (error) {
    console.error('Error al cargar ventas:', error);
  }
}

  async agregarVentas() {
    try {
      await this.ventasService.addVentas({
        producto: 'Nuevo Producto',
        categoria: '',
        codigo: '',
        marca: '',
        cantidad: 0,
        precio_venta: 0,
        lote: '',
        caducidad: new Date(),
        user_id: this.userId,
        vendido: false,
        fecha_ingreso: new Date(),
        facturado: false
      });
      await this.cargarVentas();
    } catch (error) {
      console.error('Error al agregar producto nuevo:', error);
    }
  }
  async toggleDropdownActions() {
    this.mostrarDropdownActions = !this.mostrarDropdownActions;
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

  // Actions
  const actionsDropdown = this.actionsDropdown?.nativeElement;
  const actionsBtn = this.actionsBtn?.nativeElement;
  if (
    this.mostrarDropdownActions &&
    actionsDropdown && actionsBtn &&
    !actionsDropdown.contains(event.target) &&
    !actionsBtn.contains(event.target)
  ) {
    this.mostrarDropdownActions = false;
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


  abrirModalEliminar(id: number) {
    this.ventasEliminar = id;
    this.mostrarModalEliminar = true;
  }

  async confirmarEliminarVentas() {
    if (this.ventasEliminar !== null) {
      await this.eliminarVentas(this.ventasEliminar);
      this.ventasEliminar = null;
      this.mostrarModalEliminar = false;
    }
  }

  async eliminarVentas(id: number) {
  try {
    await this.ventasService.deleteVentas(id);
    await this.cargarVentas();
  } catch (error: any) {
    console.error('Error al eliminar producto:', error?.message || error);
    alert('Error al eliminar: ' + (error?.message || JSON.stringify(error)));
  }
}

  // ...
  async actualizarVentas(id: number, ventas: {created_at?: Date, producto: string, categoria: string, marca: string, cantidad: number, precio_venta: number, lote: string, caducidad: Date, user_id: string, vendido?: boolean, fecha_ingreso?: Date}) {
    try {
      await this.ventasService.updateVentas(id, ventas);
      await this.cargarVentas();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  }

  abrirModalActualizar(ventas: any) {
  // Clona la tarea para no modificar el array original hasta guardar
  this.ventasActualizar = { ...ventas };
  this.mostrarModalActualizar = true;
}

cerrarModalActualizar() {
  this.ventasActualizar = null;
  this.mostrarModalActualizar = false;
}


  async signOut() {    // Cierra el menú de acciones si está abierto
    await this.authService.signOut();
    this.router.navigate(['auth/log-in']);
  }

async obtenerAvatarUrl(event: any) {
  const file: File = event.target.files[0];
  if (!file) return;

  const filePath =  `${this.userId}/${file.name}`;
  const { data, error } = await this.supabaseClient.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error('Error al subir avatar:', error);
    return;
  }

  //Obtener la URL del avatar
  const { data: publicUrlData } = this.supabaseClient.storage
    .from('avatars')
    .getPublicUrl(filePath);

  this.avatarUrl = publicUrlData.publicUrl;

  // Actualizar el avatar en la tabla 'usuarios'
  await this.supabaseClient
    .from('usuarios')
    .update({ avatar_url: this.avatarUrl })
    .eq('user_id', this.userId);
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

  // Funciones para la paginación

  get totalPages(): number {
    return Math.ceil(this.ventas.length / this.itemsPerPage);
  }

  get ventasPaginadas(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.ventas.slice(startIndex, startIndex + this.itemsPerPage);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.currentPage = pagina;
  }

  //Se actualiza el avatar del usuario
  private async cargarDatosUsuario() {
    const session = await this.authService.session();
    const user = session.data.session?.user;
    if (!user) return;

    const { data } = await this.supabaseClient
      .from('usuarios')
      .select('nombre, email, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (data) {
      this.firstName = data.nombre || '';
      this.email = data.email || '';
      this.avatarUrl = data.avatar_url || '';
    }
  }

    getNumeroProducto(index: number): number {
      return (this.currentPage - 1) * this.itemsPerPage + index + 1;
  }

  getTotalVentas(): number {
  return this.ventas.reduce((total, venta) => total + (venta.precio_venta * venta.cantidad), 0);
}

  async guardarActualizacionVentas() {
  if (this.ventasActualizar && this.ventasActualizar.id) {
    // Validación: solo permitir marcar como vendido si cantidad es 0
    if (this.ventasActualizar.vendido && this.ventasActualizar.cantidad > 0) {
      alert('No puedes marcar como vendido si la cantidad no es 0.');
      return;
    }
    try {
      await this.ventasService.updateVentas(this.ventasActualizar.id, {
        producto: this.ventasActualizar.producto,
        codigo: this.ventasActualizar.codigo,
        categoria: this.ventasActualizar.categoria,
        marca: this.ventasActualizar.marca,
        cantidad: this.ventasActualizar.cantidad,
        precio_venta: this.ventasActualizar.precio_venta,
        lote: this.ventasActualizar.lote,
        caducidad: this.ventasActualizar.caducidad,
        vendido: this.ventasActualizar.vendido,
        fecha_ingreso: this.ventasActualizar.fecha_ingreso,
        facturado: this.ventasActualizar.facturado,
      });
      await this.cargarVentas();
      this.cerrarModalActualizar();
    } catch (error) {
      console.error('Error al actualizar almacen2:', error);
    }
  }
}
//Barra de búsqueda

buscar() {
  const term = this.searchTerm.trim().toLowerCase();
  if (!term) {
    this.resultadosBusqueda = null; // Usa null para distinguir "sin búsqueda"
    return;
  }
  this.resultadosBusqueda = this.ventas.filter(item =>
    (item.producto && item.producto.toLowerCase().includes(term)) ||
    (item.marca && item.marca.toLowerCase().includes(term)) ||
    (item.categoria && item.categoria.toLowerCase().includes(term)) ||
    (item.lote && item.lote.toLowerCase().includes(term)) ||
    (item.codigo && item.codigo.toLowerCase().includes(term))
  );
}


async toggleFacturado(ventas: any) {
  try {
    const nuevoEstado = !ventas.facturado;
    await this.ventasService.updateVentas(ventas.id, { facturado: nuevoEstado });
    ventas.facturado = nuevoEstado; // Actualiza en la vista sin recargar todo
  } catch (error) {
    console.error('Error al actualizar facturación:', error);
    alert('No se pudo actualizar el estado de facturación.');
  }
}
}


