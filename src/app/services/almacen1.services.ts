import { Injectable, inject } from "@angular/core";
import { SupabaseService } from "./supabase.service";

//Define la interfaz Almacen1
interface Almacen1 {
    id?: number;
    costo?: string | number;
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
    proveedores_id?: number;
}

@Injectable({ providedIn: 'root' })
export class Almacen1Service {
    private supabaseClient = inject(SupabaseService).supabaseClient;

    // CREAR
    async addAlmacen1(almacen1: {
        producto: string;
        costo?: string | number;
        categoria: string;
        marca: string;
        cantidad: number;
        precio_venta: number;
        lote: string;
        caducidad: Date;
        user_id: string;
        vendido?: boolean;
        fecha_ingreso?: Date;
        almacen?: String;
        proveedores_id?: number;
    }) {
        const { data, error } = await this.supabaseClient
            .from('almacen1')
            .insert([almacen1])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
    

    // LEER PAGINADO
    async getAlmacen1Paginado(
        page: number = 1, 
        pageSize: number = 50, 
        searchTerm: string = ''
    ): Promise<{data: Almacen1[], count: number}> {
        let query = this.supabaseClient
            .from('almacen1')
            .select(`*, proveedor:proveedores_id (nombre)`, { count: 'exact' });

        // Aplicar filtro de búsqueda si existe
        if (searchTerm) {
            query = query.or(`producto.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,lote.ilike.%${searchTerm}%`);
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

    // LEER (mantener para compatibilidad)
    async getAlmacen1Global(): Promise<Almacen1[]> {
        const { data, error } = await this.supabaseClient
            .from('almacen1')
            .select(`*, proveedor:proveedores_id (nombre)`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }


    // ACTUALIZAR
    async updateAlmacen1(id: number, almacen1: {
        producto?: string;
        costo?: string | number;
        categoria?: string;
        marca?: string;
        cantidad?: number;
        precio_venta?: number;
        lote?: string;
        caducidad?: Date;
        vendido?: boolean;
        fecha_ingreso?: Date;
        almacen?: String;
        proveedores_id?: number;
    }) {
        const { data, error } = await this.supabaseClient
            .from('almacen1')
            .update(almacen1)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ELIMINAR
async deleteAlmacen1(id: number) {
const { error } = await this.supabaseClient
    .from('almacen1')
    .delete()
    .eq('id', id);
    if (error) throw error;
}

    // ELIMINACIÓN MASIVA
    async deleteAllAlmacen1(userId: string) {
        const { error } = await this.supabaseClient
            .from('almacen1')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
    }
}