import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { VentasService } from '../../../services/ventas.services';
import { ProveedoresService } from '../../../services/proveedores.services';
import { AuthService } from '../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { PdfService, NotaVentaCompleta, VentaParaNota } from '../../../services/pdf.services';

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

  //Variables para la paginación de ventas 
  currentPage: number = 1;
  itemsPerPage: number = 15;

  //Motor de búsqueda
  searchTerm: string = '';
  resultadosBusqueda: null | any[] = null;

  //Motor de búsqueda de clientes
  searchTermClientes: string = '';
  resultadosBusquedaClientes: null | any[] = null;

  // Variables para agregar clientes a las ventas
  clientes: any[] = [];
  nuevoCliente = { nombre: '', telefono: '', email: '' };
  clienteSeleccionadoId: number | null = null;


  //Variables para la paginación de clientes
  currentPageClientes: number = 1;
  itemsPerPageClientes: number = 5;
  cliente: any;

  // Variables para asiganar proveedores a los productos
  proveedores: any[] = [];

  // Variables para generar los PDF
  totalVentas: number = 0;
  isLoading: boolean = false;
  searchTimeout: any;

  // Variables para generar notas PDF
  mostrarModalNota = false;
  ventasSeleccionadas: Set<number> = new Set();
  todasSeleccionadas = false;
  observacionesNota = '';
  clienteNota = '';
  generandoPDF = false;
  configNota = {
    cliente: '',
    observaciones: ''
  };

  constructor(
    private ventasService: VentasService,
    private proveedoresService: ProveedoresService,
    private router: Router,
    private authService: AuthService,
    private pdfService: PdfService
  ) {}

  

  async ngOnInit() {
    await this.ensureUsuario();
    await this.init();
    await this.cargarDatosUsuario();
    this.cargarVentas();
    this.proveedores = await this.proveedoresService.getProveedores();
    this.ventasSub = this.ventasService.ventasActualizadas$.subscribe(() => {
    this.cargarVentas();
    this.cargarClientes();
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

  async cargarClientes() {
    try {
      this.clientes = await this.ventasService.getClientes();
          this.cambiarPaginaClientes(this.currentPageClientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  }

  async cargarVentas(page: number = 1, searchTerm: string = '') {
    try {
      this.isLoading = true;
      const result = await this.ventasService.getVentasPaginadas(page, this.itemsPerPage, searchTerm);
      this.ventas = result.data;
      this.totalVentas = result.count;
      this.currentPage = page;
      
      // Debug temporal para verificar proveedores
      if (this.ventas.length > 0) {
        console.log('Primera venta con proveedores:', this.ventas[0]);
        console.log('¿Tiene proveedores?:', this.ventas[0].proveedores);
      }
      
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      this.isLoading = false;
    }
  }

async agregarVentas() {
  try {
    const nuevaVenta: any = {
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
      facturado: false,
    };
    if (this.clienteSeleccionadoId !== null) {
      nuevaVenta.cliente_id = this.clienteSeleccionadoId; // Asigna el cliente seleccionado solo si no es null
    }
    await this.ventasService.addVentas(nuevaVenta);
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
  async actualizarVentas(id: number, ventas: {created_at?: Date, producto: string, categoria: string, marca: string, codigo: string, cantidad: number, precio_venta: number, lote: string, caducidad: Date, user_id: string, vendido?: boolean, fecha_ingreso?: Date, cliente_id?: number}) {
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
  return Math.ceil(this.totalVentas / this.itemsPerPage); // Usar totalVentas en lugar de ventas.length
}

get ventasPaginadas(): any[] {
  // Como ya viene paginado del servidor, solo devolvemos las ventas actuales
  return this.ventas;
}

async cambiarPagina(pagina: number) {
  if (pagina < 1 || pagina > this.totalPages || this.isLoading) return;
  await this.cargarVentas(pagina, this.searchTerm);
}

onSearchInput() {
  clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(() => {
    this.buscar();
  }, 500);
}

getNumeroVenta(index: number): number {
  return (this.currentPage - 1) * this.itemsPerPage + index + 1;
}

getPaginasVisibles(): number[] {
  const paginas: number[] = [];
  const inicio = Math.max(1, this.currentPage - 2);
  const fin = Math.min(this.totalPages, this.currentPage + 2);
  
  for (let i = inicio; i <= fin; i++) {
    paginas.push(i);
  }
  
  return paginas;
}

// Funciones para selección de ventas
toggleVenta(venta: any) {
  console.log('Toggle venta:', venta);
  const ventaId = venta.id;
  if (this.ventasSeleccionadas.has(ventaId)) {
    this.ventasSeleccionadas.delete(ventaId);
  } else {
    this.ventasSeleccionadas.add(ventaId);
  }
  this.actualizarEstadoSeleccionTodas();
  console.log('Ventas seleccionadas:', Array.from(this.ventasSeleccionadas));
}

isVentaSeleccionada(ventaId: number): boolean {
  return this.ventasSeleccionadas.has(ventaId);
}

toggleTodasLasVentas() {
  if (this.todasSeleccionadas) {
    this.ventasSeleccionadas.clear();
  } else {
    this.ventas.forEach(venta => {
      this.ventasSeleccionadas.add(venta.id);
    });
  }
  this.todasSeleccionadas = !this.todasSeleccionadas;
}

private actualizarEstadoSeleccionTodas() {
  this.todasSeleccionadas = this.ventas.length > 0 && 
    this.ventas.every(venta => this.ventasSeleccionadas.has(venta.id));
}

// Funciones para generar nota PDF
abrirModalNota() {
  if (this.ventasSeleccionadas.size === 0) {
    alert('Selecciona al menos una venta para generar la nota');
    return;
  }
  this.mostrarModalNota = true;
}

  cerrarModalNota() {
    this.mostrarModalNota = false;
    this.observacionesNota = '';
    this.clienteNota = '';
    this.configNota = {
      cliente: '',
      observaciones: ''
    };
    this.generandoPDF = false;
  }async generarNotaPDF() {
  if (this.ventasSeleccionadas.size === 0) {
    alert('Selecciona al menos una venta');
    return;
  }

  this.generandoPDF = true;
  
  try {
    // Obtener las ventas seleccionadas
    const ventasParaNota = this.ventas.filter(venta => 
      this.ventasSeleccionadas.has(venta.id)
    );

    // Convertir a formato para PDF
    const ventasFormateadas: VentaParaNota[] = ventasParaNota.map(venta => {
      // Buscar el nombre del cliente - probando diferentes campos
      let nombreCliente = 'Sin Cliente';
      
      // Verificar si viene el cliente en la relación de Supabase
      if (venta.clientes && venta.clientes.nombre) {
        nombreCliente = venta.clientes.nombre;
      } else if (venta.cliente_id && this.clientes) {
        const cliente = this.clientes.find(c => c.id === venta.cliente_id);
        nombreCliente = cliente ? cliente.nombre : 'Cliente no especificado';
      }

      const subtotal = (venta.cantidad || 1) * (venta.precio_venta || 0);

      return {
        id: venta.id,
        producto: venta.producto || 'Producto no especificado',
        marca: venta.marca || 'Sin marca',
        categoria: venta.categoria || 'Sin categoría',
        cantidad_vendida: venta.cantidad || 1,
        precio_venta: venta.precio_venta || 0,
        subtotal: subtotal,
        fecha_venta: new Date(venta.created_at || venta.fecha_ingreso || Date.now()),
        cliente: nombreCliente,
        lote: venta.lote || 'Sin lote'
      };
    });

    console.log('Ventas formateadas:', ventasFormateadas);

    // Calcular totales (sin IVA)
    const subtotal = ventasFormateadas.reduce((sum, venta) => sum + venta.subtotal, 0);
    const iva = 0; // IVA en 0%
    const total = subtotal; // Total igual al subtotal

    // Determinar cliente principal
    const clientesUnicos = [...new Set(ventasFormateadas.map(v => v.cliente))];
    const clientePrincipal = this.configNota.cliente || 
      (clientesUnicos.length === 1 ? clientesUnicos[0] : 'Varios clientes');

    const notaVenta: NotaVentaCompleta = {
      numeroNota: this.generarNumeroNota(),
      fecha: new Date(),
      cliente: clientePrincipal,
      ventas: ventasFormateadas,
      subtotal: subtotal,
      iva: iva,
      total: total,
      observaciones: this.configNota.observaciones || undefined
    };

    await this.pdfService.generarNotaVentasSeleccionadas(notaVenta);
    this.cerrarModalNota();
    alert('PDF generado correctamente');
    
  } catch (error) {
    console.error('Error al generar nota PDF:', error);
    alert('Error al generar la nota PDF: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
  } finally {
    this.generandoPDF = false;
  }
}

private generarNumeroNota(): string {
  const fecha = new Date();
  const timestamp = fecha.getTime();
  return `NV-${timestamp.toString().slice(-8)}`;
}

limpiarSeleccion() {
  this.ventasSeleccionadas.clear();
  this.todasSeleccionadas = false;
}

get ventasSeleccionadasArray(): any[] {
  return this.ventas.filter(venta => this.ventasSeleccionadas.has(venta.id));
}

get totalSeleccionado(): number {
  return this.ventasSeleccionadasArray.reduce((sum, venta) => {
    const cantidad = venta.cantidad || 1;
    const precio = venta.precio_venta || 0;
    return sum + (cantidad * precio);
  }, 0);
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

    getNumeroProducto(index: number): number {
      return (this.currentPage - 1) * this.itemsPerPage + index + 1;
  }

  getTotalVentas(): number {
  return this.ventas.reduce((total, venta) => total + (venta.precio_venta * venta.cantidad), 0);
}

  async guardarActualizacionVentas() {
  if (this.ventasActualizar && this.ventasActualizar.id) {
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
        proveedores_id: this.ventasActualizar.proveedores_id || null,
        cliente_id: this.ventasActualizar.cliente_id || null
      });
      await this.cargarVentas();
      this.cerrarModalActualizar();
    } catch (error) {
      console.error('Error al actualizar almacen2:', error);
    }
  }
}

mostrarNombreCompleto(nombre: string) {
  alert('Nombre completo: ' + nombre);
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
    (item.codigo && item.codigo.toLowerCase().includes(term)) ||
    (item.cliente_id && this.clientes.find(c => c.id === item.cliente_id && c.nombre.toLowerCase().includes(term))) ||
    (item.proveedores_id && this.proveedores.find(p => p.id === item.proveedores_id && p.nombre.toLowerCase().includes(term)))
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
  const cliente = await this.ventasService.addCliente(this.nuevoCliente);
  this.clientes.push(cliente);
  this.nuevoCliente = { nombre: '', telefono: '', email: '' };
}
}


