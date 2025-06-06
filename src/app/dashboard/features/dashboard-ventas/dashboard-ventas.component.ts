import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { TareaService } from '../../../services/tarea.services';
import { AuthService } from '../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { PostgrestError } from '@supabase/supabase-js';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
@Component({
  selector: 'app-dashboard-ventas',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './dashboard-ventas.component.html',
  styles: ``
})
export class DashboardVentasComponent implements OnInit {
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
  tareas: any[] = [];
  userId: string = '';
  showDropdown = false;
  private supabaseClient = inject(SupabaseService).supabaseClient;
  mostrarModalEliminar = false;
  tareaAEliminar: number | null = null;
  tareaActualizar: any = null;

  //Variables para función de botón de Acciones
  mostrarModalActualizar = false;
  mostrarModalEdicionMasiva = false;
  tareasEdicionMasiva: any[] = [];
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
    private tareasService: TareaService,
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
      await this.cargarTareas();
    } catch (error) {
      console.error('Error al obtener la sesión:', error);
    }
  }

  async cargarTareas() {
    try {
      this.tareas = await this.tareasService.getTareasByUserId(this.userId);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    }
  }

  async agregarTarea() {
    try {
      await this.tareasService.addTarea({
        titulo: 'Nueva tarea',
        descripcion: 'Descripción de la tarea',
        user_id: this.userId
      });
      await this.cargarTareas();
    } catch (error) {
      console.error('Error al agregar tarea:', error);
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
    this.tareaAEliminar = id;
    this.mostrarModalEliminar = true;
  }

  async confirmarEliminarTarea() {
    if (this.tareaAEliminar !== null) {
      await this.eliminarTarea(this.tareaAEliminar);
      this.tareaAEliminar = null;
      this.mostrarModalEliminar = false;
    }
  }

  async eliminarTarea(id: number) {
    try {
      await this.tareasService.deleteTarea(id);
      await this.cargarTareas();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  }
  // ...
  async actualizarTarea(id: number, tarea: { titulo?: string; descripcion?: string }) {
    try {
      await this.tareasService.updateTarea(id, tarea);
      await this.cargarTareas();
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  }

  abrirModalActualizar(tarea: any) {
  // Clona la tarea para no modificar el array original hasta guardar
  this.tareaActualizar = { ...tarea };
  this.mostrarModalActualizar = true;
}

cerrarModalActualizar() {
  this.tareaActualizar = null;
  this.mostrarModalActualizar = false;
}

async guardarActualizacionTarea() {
  if (this.tareaActualizar && this.tareaActualizar.id) {
    try {
      await this.tareasService.updateTarea(this.tareaActualizar.id, {
        titulo: this.tareaActualizar.titulo,
        descripcion: this.tareaActualizar.descripcion
      });
      await this.cargarTareas();
      this.cerrarModalActualizar();
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  }
}

abrirModalEdicionMasiva(){
  this.tareasEdicionMasiva = this.tareas.map(t => ({ ...t }));
  this.mostrarModalEdicionMasiva = true;
}

  cerrarModalEdicionMasiva() {
    this.tareasEdicionMasiva = [];
    this.mostrarModalEdicionMasiva = false;
  }

  async guardarEdicionMasiva() {
    try {
      for (const tarea of this.tareasEdicionMasiva) {
        await this.tareasService.updateTarea(tarea.id, {
          titulo: tarea.titulo,
          descripcion: tarea.descripcion
        });
      }
      await this.cargarTareas();
      this.cerrarModalEdicionMasiva();
    } catch (error) {
      console.error('Error al actualizar tareas en edición masiva:', error);
    }
  }


abrirModalEliminarTodas() {
  this.mostrarModalEliminarTodas = true;
}

async confirmarEliminarTodas() {
  try {
    await this.tareasService.deleteAllTareas(this.userId);
    await this.cargarTareas();
    this.mostrarModalEliminarTodas = false;
  } catch (error) {
    console.error('Error al eliminar todas las tareas:', error);
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
    return Math.ceil(this.tareas.length / this.itemsPerPage);
  }

  get tareasPaginadas(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.tareas.slice(startIndex, startIndex + this.itemsPerPage);
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
}


