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
            .select(`
              *,
              clientes:cliente_id (
                nombre
              )
            `)
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
}