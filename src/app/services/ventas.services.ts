import { Injectable, inject } from "@angular/core";
import { SupabaseService } from "./supabase.service";
import { BehaviorSubject } from 'rxjs';

//Define la interfaz Almacen1
interface Ventas {
    id?: number;
    codigo?: string;
    created_at?: string;
    producto: string;
    categoria: string;
    marca: string;
    cantidad: number;
    precio_venta: number;
    lote: string;
    caducidad: Date;
    user_id: string;
    vendido: boolean;
    fecha_ingreso: Date;
    almacen?: String;
    facturado?: boolean;
    cliente_id?: number; 
    proveedores_id?: number;
}

@Injectable({ providedIn: 'root' })
export class VentasService {
    private supabaseClient = inject(SupabaseService).supabaseClient;
    private ventasActualizadas = new BehaviorSubject<void>(undefined);
    ventasActualizadas$ = this.ventasActualizadas.asObservable();

    // CREAR
    async addVentas(ventas: {
        producto: string;
        codigo?: string;
        categoria: string;
        marca: string;
        cantidad: number;
        precio_venta: number;
        lote: string;
        caducidad: Date;
        user_id: string;
        vendido?: boolean;
        fecha_ingreso?: Date;
        facturado?: boolean;
        cliente_id?: number; 
        proveedores_id?: number;
}) {
        const { data, error } = await this.supabaseClient
            .from('ventas')
            .insert([ventas])
            .select('*, cliente_id(nombre)')
            .single();
        if (error) throw error;
        return data;
    }

    // LEER
        async getTodasLasVentas(): Promise<Ventas[]> {
        const { data, error } = await this.supabaseClient
            .from('ventas')
            .select(`*,clientes:cliente_id (nombre), proveedores:proveedores_id (nombre)`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
        }

    // ACTUALIZAR
    async updateVentas(id: number, ventas: {
        producto?: string;
        codigo?: string;
        categoria?: string;
        marca?: string;
        cantidad?: number;
        precio_venta?: number;
        lote?: string;
        caducidad?: Date;
        vendido?: boolean;
        fecha_ingreso?: Date;
        almacen?: String;
        facturado?: boolean;
        cliente_id?: number; 
        proveedores_id?: number;
}) {
    const { data, error } = await this.supabaseClient
        .from('ventas')
        .update(ventas)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

        // ELIMINAR
async deleteVentas(id: number) {
const { error } = await this.supabaseClient
    .from('ventas')
    .delete()
    .eq('id', id);
    if (error) throw error;
}


    // Agregar las ventas que vengan de los almacenes

    notificarActualizacion() {
    this.ventasActualizadas.next();
    }

    async addVenta(venta: Ventas) {
    const { data, error } = await this.supabaseClient
    .from('ventas')
    .insert([venta])
    .select()
    .single();
    if (error) throw error;
    this.notificarActualizacion();
    return data;
    }


    // Obtener los clientes 

    async getClientes(): Promise<any[]> {
        const { data, error } = await this.supabaseClient
            .from('clientes')
            .select('*');
    if (error) throw error;
    return data || [];
    }

    async addCliente(cliente: any) {
        const { data, error } = await this.supabaseClient
    .from('clientes')
    .insert([cliente])
    .select()
    .single();
        if (error) throw error;
        return data;
    }

    async deleteCliente(id: number) {
        const { error } = await this.supabaseClient
            .from('clientes')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }

    async updateCliente(id: number, cliente: any) {
        const { data, error } = await this.supabaseClient
            .from('clientes')
            .update(cliente)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async getVentasPaginadas(
  page: number = 1, 
  pageSize: number = 50, 
  searchTerm: string = ''
): Promise<{data: any[], count: number}> {
  let query = this.supabaseClient
    .from('ventas')
    .select(`
      *, 
      clientes:cliente_id (id, nombre, telefono, email),
      proveedores:proveedores_id (id, nombre)
    `, { count: 'exact' });

  // Aplicar filtro de búsqueda si existe
  if (searchTerm) {
    query = query.or(`
      producto.ilike.%${searchTerm}%,
      marca.ilike.%${searchTerm}%,
      categoria.ilike.%${searchTerm}%,
      codigo.ilike.%${searchTerm}%,
      lote.ilike.%${searchTerm}%,
      clientes.nombre.ilike.%${searchTerm}%
    `);
  }

  // Calcular rango para paginación
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}
}