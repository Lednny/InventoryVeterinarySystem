import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

// Define la interfaz Reporte
interface Reporte {
    id?: number;
    titulo: string;
    descripcion: string;
    user_id: string;
    fecha_creacion?: Date;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
    private supabaseClient = inject(SupabaseService).supabaseClient;

    // CREAR
    async addReporte(reporte: { titulo: string; descripcion: string; user_id: string }) {
        const { data, error } = await this.supabaseClient
            .from('reportes')
            .insert([reporte])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // LEER
    async getReportesByUserId(userId: string): Promise<Reporte[]> {
        const { data, error } = await this.supabaseClient
            .from('reportes')
            .select('*')
            .eq('user_id', userId)
            .order('fecha_creacion', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }

    // ACTUALIZAR
    async updateReporte(id: number, reporte: { titulo?: string; descripcion?: string }) {
        const { data, error } = await this.supabaseClient
            .from('reportes')
            .update(reporte)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // ELIMINAR
    async deleteReporte(id: number) {
        const { error } = await this.supabaseClient
            .from('reportes')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // ELIMINACIÓN MASIVA
    async deleteAllReportes(userId: string) {
        const { error } = await this.supabaseClient
            .from('reportes')
            .delete()
            .eq('user_id', userId);
        
        if (error) throw error;
    }
}