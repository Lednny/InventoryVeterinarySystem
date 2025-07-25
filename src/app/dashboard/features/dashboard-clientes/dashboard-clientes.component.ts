import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { VentasService } from '../../../services/ventas.services';
import { AuthService } from '../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
@Component({
  selector: 'app-dashboard-clientes',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './dashboard-clientes.component.html',
  styles: ``
})
export class DashboardClientesComponent implements OnInit{
  @ViewChild('menuGridBtn') menuGridBtn!: ElementRef;
  @ViewChild('menuGridDropdown') menuGridDropdown!: ElementRef;
  @ViewChild('UserDropdown') UserDropdown!: ElementRef;
  @ViewChild('UserBtn') UserBtn!: ElementRef;
  //Varriables para Funcionalidades de la aplicación
  
  // Variables para las operaciones CRUD de clientes
  userId: string = '';
  mostrarModalActualizar = false;
  mostrarModalEliminarClientes = false;
  private supabaseClient = inject(SupabaseService).supabaseClient;
  clientesEliminar: number | null = null;
  clientesActualizar: any = null;

  // Variables para el avatar del usuario
  avatarUrl: string = '';
  firstName = '';
  email = '';
  mostrarUserDropdown = false;


  //Variables para Dropdown de boton GRID
  mostrarMenuGrid = false;

  //Motor de búsqueda de clientes
  searchTermClientes: string = '';
  resultadosBusquedaClientes: null | any[] = null;

  // Variables para agregar clientes a las ventas
  clientes: any[] = [];
  nuevoCliente = { nombre: '', telefono: '', email: '' };


  //Variables para la paginación de clientes
  currentPageClientes: number = 1;
  itemsPerPageClientes: number = 5;
  cliente: any;

  constructor(
    private ventasService: VentasService,
    private router: Router,
    private authService: AuthService
  ) {}

  

  async ngOnInit() {
    await this.ensureUsuario();
    await this.init();
    await this.cargarDatosUsuario();
    this.cargarClientes();

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

  async cargarClientes() {
    try {
      this.clientes = await this.ventasService.getClientes();
          this.cambiarPaginaClientes(this.currentPageClientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
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


  abrirModalEliminarClientes(id: number) {
    this.clientesEliminar = id;
    this.mostrarModalEliminarClientes = true;
  }

  
cerrarModalEliminarClientes() {
  this.mostrarModalEliminarClientes = false;
  this.clientesEliminar = null;
}

  async confirmarEliminarClientes() {
    if (this.clientesEliminar !== null) {
      await this.eliminarClientes(this.clientesEliminar);
      this.clientesEliminar = null;
      this.mostrarModalEliminarClientes = false;
    }
  }

  async eliminarClientes(id: number) {
  try {
    await this.ventasService.deleteCliente(id);
    await this.cargarClientes();
  } catch (error: any) {
    console.error('Error al eliminar cliente:', error?.message || error);
    alert('Error al eliminar: ' + (error?.message || JSON.stringify(error)));
  }
}

  // ...
  async actualizarClientes(id: number, nombre: string, telefono: string, email: string) {
    try {
      await this.ventasService.updateCliente(id, {
        nombre: nombre,
        telefono: telefono,
        email: email
      });
      await this.cargarClientes();
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
    }
  }

  abrirModalActualizarClientes(cliente: any) {
  this.mostrarModalEliminarClientes = false;
  this.clientesActualizar = { ...cliente };
  this.mostrarModalActualizar = true;
}

cerrarModalActualizarClientes() {
  this.clientesActualizar = null;
  this.mostrarModalActualizar = false;
}


  async signOut() {    // Cierra el menú de acciones si está abierto
    await this.authService.signOut();
    window.location.href = '/auth/log-in'; // Fuerza recarga y navegación limpia
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

  //Funciones para la paginación de clientes
  get totalPagesClientes(): number {
    return Math.ceil(this.clientes.length / this.itemsPerPageClientes);
  }

  get clientesPaginados(): any[] {
    const startIndex = (this.currentPageClientes - 1) * this.itemsPerPageClientes;
    return this.clientes.slice(startIndex, startIndex + this.itemsPerPageClientes);
  }

  cambiarPaginaClientes(pagina: number) {
    if (pagina < 1 || pagina > this.totalPagesClientes) return;
    this.currentPageClientes = pagina;
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
buscarClientes() {
  const term = this.searchTermClientes.trim().toLowerCase();
  if (!term) {
    this.resultadosBusquedaClientes = null; // Usa null para distinguir "sin búsqueda"
    return;
  }
  this.resultadosBusquedaClientes = this.clientes.filter(cliente =>
    (cliente.nombre && cliente.nombre.toLowerCase().includes(term)) ||
    (cliente.telefono && cliente.telefono.toLowerCase().includes(term)) ||
    (cliente.email && cliente.email.toLowerCase().includes(term))
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

async agregarCliente() {
  if (!this.nuevoCliente.nombre || !this.nuevoCliente.telefono || !this.nuevoCliente.email) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  try {
    const clienteAgregado = await this.ventasService.addCliente(this.nuevoCliente);
    this.clientes.push(clienteAgregado);
    this.nuevoCliente = { nombre: '', telefono: '', email: '' }; // Resetea el formulario
    await this.cargarClientes();
  } catch (error) {
    console.error('Error al agregar cliente:', error);
    alert('No se pudo agregar el cliente.');
  }
}
}


