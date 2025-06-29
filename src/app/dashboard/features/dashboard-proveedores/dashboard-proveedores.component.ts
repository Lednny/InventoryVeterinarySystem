import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ProveedoresService } from '../../../services/proveedores.services';
import { AuthService } from '../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dashboard-proveedores',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './dashboard-proveedores.component.html',
  styles: `` 
})
export class DashboardProveedoresComponent implements OnInit{
@ViewChild('menuGridBtn') menuGridBtn!: ElementRef;
  @ViewChild('menuGridDropdown') menuGridDropdown!: ElementRef;
  @ViewChild('UserDropdown') UserDropdown!: ElementRef;
  @ViewChild('UserBtn') UserBtn!: ElementRef;
  //Varriables para Funcionalidades de la aplicación
  
  // Variables para las operaciones CRUD de proveedores
  userId: string = '';
  mostrarModalActualizar = false;
  mostrarModalEliminarProveedores = false;
  private supabaseClient = inject(SupabaseService).supabaseClient;
  proveedoresEliminar: number | null = null;
  proveedoresActualizar: any = null;

  // Variables para el avatar del usuario
  avatarUrl: string = '';
  firstName = '';
  email = '';
  mostrarUserDropdown = false;


  //Variables para Dropdown de boton GRID
  mostrarMenuGrid = false;

  //Motor de búsqueda de proveedores
  searchTermProveedores: string = '';
  resultadosBusquedaProveedores: null | any[] = null;

  // Variables para agregar proveedores a las ventas
  proveedores: any[] = [];
  nuevoProveedor = { nombre: '', telefono: '', email: '' };


  //Variables para la paginación de proveedores
  currentPageProveedores: number = 1;
  itemsPerPageProveedores: number = 5;
  proveedor: any;

  constructor(
    private proveedoresService: ProveedoresService,
    private router: Router,
    private authService: AuthService
  ) {}

  

  async ngOnInit() {
    await this.ensureUsuario();
    await this.init();
    await this.cargarDatosUsuario();
    this.cargarProveedores();

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
    } catch (error) {
      console.error('Error al obtener la sesión:', error);
    }
  }

  async cargarProveedores() {
    try {
      this.proveedores = await this.proveedoresService.getProveedores();
          this.cambiarPaginaProveedores(this.currentPageProveedores);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  }


@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {


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


  abrirModalEliminarProveedores(id: number) {
    this.proveedoresEliminar = id;
    this.mostrarModalEliminarProveedores = true;
  }

  
cerrarModalEliminarProveedores() {
  this.mostrarModalEliminarProveedores = false;
  this.proveedoresEliminar = null;
}

  async confirmarEliminarProveedores() {
    if (this.proveedoresEliminar !== null) {
      await this.eliminarProveedores(this.proveedoresEliminar);
      this.proveedoresEliminar = null;
      this.mostrarModalEliminarProveedores = false;
    }
  }

  async eliminarProveedores(id: number) {
  try {
    await this.proveedoresService.deleteProveedor(id);
    await this.cargarProveedores();
  } catch (error: any) {
    console.error('Error al eliminar proveedor:', error?.message || error);
    alert('Error al eliminar: ' + (error?.message || JSON.stringify(error)));
  }
}

  // ...
  async actualizarProveedores(id: number, nombre: string, telefono: string, email: string) {
    try {
      await this.proveedoresService.updateProveedor(id, {
        nombre: nombre,
        telefono: telefono,
        email: email
      });
      await this.cargarProveedores();
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
    }
  }

  abrirModalActualizarProveedores(proveedor: any) {
  this.mostrarModalEliminarProveedores = false;
  this.proveedoresActualizar = { ...proveedor };
  this.mostrarModalActualizar = true;
}

cerrarModalActualizarProveedores() {
  this.proveedoresActualizar = null;
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

  toggleMenuGrid() {
    this.mostrarMenuGrid = !this.mostrarMenuGrid;
  }

  toggleDropdownUser() {
    this.mostrarUserDropdown = !this.mostrarUserDropdown;
  }

  //Funciones para la paginación de proveedores
  get totalPagesProveedores(): number {
    return Math.ceil(this.proveedores.length / this.itemsPerPageProveedores);
  }

  get proveedoresPaginados(): any[] {
    const startIndex = (this.currentPageProveedores - 1) * this.itemsPerPageProveedores;
    return this.proveedores.slice(startIndex, startIndex + this.itemsPerPageProveedores);
  }

  cambiarPaginaProveedores(pagina: number) {
    if (pagina < 1 || pagina > this.totalPagesProveedores) return;
    this.currentPageProveedores = pagina;
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
buscarProveedores() {
  const term = this.searchTermProveedores.trim().toLowerCase();
  if (!term) {
    this.resultadosBusquedaProveedores = null; // Usa null para distinguir "sin búsqueda"
    return;
  }
  this.resultadosBusquedaProveedores = this.proveedores.filter(proveedor =>
    (proveedor.nombre && proveedor.nombre.toLowerCase().includes(term)) ||
    (proveedor.telefono && proveedor.telefono.toLowerCase().includes(term)) ||
    (proveedor.email && proveedor.email.toLowerCase().includes(term))
  );
}


async agregarProveedor() {
  if (!this.nuevoProveedor.nombre || !this.nuevoProveedor.telefono || !this.nuevoProveedor.email) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  try {
    const proveedorAgregado = await this.proveedoresService.addProveedor(this.nuevoProveedor);
    this.proveedores.push(proveedorAgregado);
    this.nuevoProveedor = { nombre: '', telefono: '', email: '' }; // Resetea el formulario
    await this.cargarProveedores();
  } catch (error) {
    console.error('Error al agregar proveedor:', error);
    alert('No se pudo agregar el proveedor.');
  }
}
}
