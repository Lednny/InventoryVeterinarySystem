import { Injectable, inject } from "@angular/core";
import { SupabaseService } from "./supabase.service";

//Define la interfaz Almacen1
interface Almacen1 {
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
export class Almacen1Service {
    private supabaseClient = inject(SupabaseService).supabaseClient;

    // CREAR
    async addAlmacen1(almacen1: {
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
            .from('almacen1')
            .insert([almacen1])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // LEER
    async getAlmacen1ByUserId(userId: string): Promise<Almacen1[]> {
        const { data, error } = await this.supabaseClient
            .from('almacen1')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // ACTUALIZAR
    async updateAlmacen1(id: number, almacen1: {
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