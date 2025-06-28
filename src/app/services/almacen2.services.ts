import { Injectable, inject } from "@angular/core";
import { SupabaseService } from "./supabase.service";

//Define la interfaz Almacen2
interface Almacen2 {
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
}

@Injectable({ providedIn: 'root' })
export class Almacen2Service {
    private supabaseClient = inject(SupabaseService).supabaseClient;

    // CREAR
    async addAlmacen2(almacen2: {
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
        almacen?: String;
    }) {
        const { data, error } = await this.supabaseClient
            .from('almacen2')
            .insert([almacen2])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // LEER
    async getAlmacen2Global(): Promise<Almacen2[]> {
    const { data, error } = await this.supabaseClient
        .from('almacen2')
        .select('*')
        .order('fecha_ingreso', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // ACTUALIZAR
    async updateAlmacen2(id: number, almacen2: {
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
    }) {
        const { data, error } = await this.supabaseClient
            .from('almacen2')
            .update(almacen2)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ELIMINAR
async deleteAlmacen2(id: number) {
const { error } = await this.supabaseClient
    .from('almacen2')
    .delete()
    .eq('id', id);
    if (error) throw error;
}

    // ELIMINACIÓN MASIVA
    async deleteAllAlmacen2(userId: string) {
        const { error } = await this.supabaseClient
            .from('almacen2')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
    }
}