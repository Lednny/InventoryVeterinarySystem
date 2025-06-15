import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { Almacen2Service } from '../../../../services/almacen2.services';
import { AuthService } from '../../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
@Component({
  selector: 'app-dashboard-almacen2',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './dashboard-almacen2.component.html',
  styles: ``
})
export class DashboardAlmacen2Component implements OnInit {
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
  almacen2: any[] = [];
  userId: string = '';
  showDropdown = false;
  private supabaseClient = inject(SupabaseService).supabaseClient;
  mostrarModalEliminar = false;
  almacen2Eliminar: number | null = null;
  almacen2Actualizar: any = null;

  //Variables para función de botón de Acciones
  mostrarModalActualizar = false;
  mostrarModalEdicionMasiva = false;
  almacen2EdicionMasiva: any[] = [];
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

  constructor(
    private almacen2Service: Almacen2Service,
    private router: Router,
    private authService: AuthService
  ) {}

  

  async ngOnInit() {
    await this.ensureUsuario();
    await this.init();
    await this.cargarDatosUsuario();
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
      const userId = session.data.session?.user?.id;
      if (!userId) {
        console.error('No hay usuario autenticado');
        // Aquí podrías redirigir al login si lo deseas
        return;
      }
      this.userId = userId;
      await this.cargarAlmacen2();
    } catch (error) {
      console.error('Error al obtener la sesión:', error);
    }
  }

  async cargarAlmacen2() {
    try {
      this.almacen2 = await this.almacen2Service.getAlmacen2ByUserId(this.userId);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    }
  }

  async agregarAlmacen2() {
    try {
      await this.almacen2Service.addAlmacen2({
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
        fecha_ingreso: new Date()
      });
      await this.cargarAlmacen2();
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
    this.almacen2Eliminar = id;
    this.mostrarModalEliminar = true;
  }

  async confirmarEliminarAlmacen2() {
    if (this.almacen2Eliminar !== null) {
      await this.eliminarAlmacen2(this.almacen2Eliminar);
      this.almacen2Eliminar = null;
      this.mostrarModalEliminar = false;
    }
  }

async eliminarAlmacen2(id: number) {
  try {
    await this.almacen2Service.deleteAlmacen2(id);
    await this.cargarAlmacen2();
  } catch (error: any) {
    console.error('Error al eliminar producto:', error?.message || error);
    alert('Error al eliminar: ' + (error?.message || JSON.stringify(error)));
  }
}

  // ...
  async actualizarAlmacen2(id: number, almacen2: {created_at?: Date, producto: string, categoria: string, marca: string, cantidad: number, precio_venta: number, lote: string, caducidad: Date, user_id: string, vendido?: boolean, fecha_ingreso?: Date}) {
    try {
      await this.almacen2Service.updateAlmacen2(id, almacen2);
      await this.cargarAlmacen2();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  }

  abrirModalActualizar(almacen2: any) {
  // Clona la tarea para no modificar el array original hasta guardar
  this.almacen2Actualizar = { ...almacen2 };
  this.mostrarModalActualizar = true;
}

cerrarModalActualizar() {
  this.almacen2Actualizar = null;
  this.mostrarModalActualizar = false;
}

abrirModalEdicionMasiva(){
  this.almacen2EdicionMasiva = this.almacen2.map(t => ({ ...t }));
  this.mostrarModalEdicionMasiva = true;
}

  cerrarModalEdicionMasiva() {
    this.almacen2EdicionMasiva = [];
    this.mostrarModalEdicionMasiva = false;
  }

  async guardarEdicionMasiva() {
    try {
      for (const tarea of this.almacen2EdicionMasiva) {
        await this.almacen2Service.updateAlmacen2(tarea.id, {
        producto: this.almacen2Actualizar.producto,
        codigo: this.almacen2Actualizar.codigo,
        categoria: this.almacen2Actualizar.categoria,
        marca: this.almacen2Actualizar.marca,
        cantidad: this.almacen2Actualizar.cantidad,
        precio_venta: this.almacen2Actualizar.precio_venta,
        lote: this.almacen2Actualizar.lote,
        caducidad: this.almacen2Actualizar.caducidad,
        vendido: this.almacen2Actualizar.vendido,
        fecha_ingreso: this.almacen2Actualizar.fecha_ingreso
        });
      }
      await this.cargarAlmacen2();
      this.cerrarModalEdicionMasiva();
    } catch (error) {
      console.error('Error al actualizar productos en edición masiva:', error);
    }
  }


abrirModalEliminarTodas() {
  this.mostrarModalEliminarTodas = true;
}

async confirmarEliminarTodas() {
  try {
    await this.almacen2Service.deleteAllAlmacen2(this.userId);
    await this.cargarAlmacen2();
    this.mostrarModalEliminarTodas = false;
  } catch (error) {
    console.error('Error al eliminar todos los productos:', error);
  }
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
    return Math.ceil(this.almacen2.length / this.itemsPerPage);
  }

  get almacen2Paginadas(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.almacen2.slice(startIndex, startIndex + this.itemsPerPage);
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

async guardarActualizacionAlmacen2() {
  if (this.almacen2Actualizar && this.almacen2Actualizar.id) {
    // Validación: solo permitir marcar como vendido si cantidad es 0
    if (this.almacen2Actualizar.vendido && this.almacen2Actualizar.cantidad > 0) {
      alert('No puedes marcar como vendido si la cantidad no es 0.');
      return;
    }
    try {
      await this.almacen2Service.updateAlmacen2(this.almacen2Actualizar.id, {
        producto: this.almacen2Actualizar.producto,
        codigo: this.almacen2Actualizar.codigo,
        categoria: this.almacen2Actualizar.categoria,
        marca: this.almacen2Actualizar.marca,
        cantidad: this.almacen2Actualizar.cantidad,
        precio_venta: this.almacen2Actualizar.precio_venta,
        lote: this.almacen2Actualizar.lote,
        caducidad: this.almacen2Actualizar.caducidad,
        vendido: this.almacen2Actualizar.vendido,
        fecha_ingreso: this.almacen2Actualizar.fecha_ingreso
      });
      await this.cargarAlmacen2();
      this.cerrarModalActualizar();
    } catch (error) {
      console.error('Error al actualizar almacen2:', error);
    }
  }
}
}
