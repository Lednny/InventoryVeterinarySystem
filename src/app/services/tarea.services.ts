import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

// Define la interfaz Tarea
interface Tarea {
    id?: number;
    titulo: string;
    descripcion: string;
    user_id: string;
    fecha_creacion?: Date;
}

@Injectable({ providedIn: 'root' })
export class TareaService {
    private supabaseClient = inject(SupabaseService).supabaseClient;

    // CREAR
    async addTarea(tarea: { titulo: string; descripcion: string; user_id: string }) {
        const { data, error } = await this.supabaseClient
            .from('tareas')
            .insert([tarea])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // LEER
    async getTareasByUserId(userId: string): Promise<Tarea[]> {
        const { data, error } = await this.supabaseClient
            .from('tareas')
            .select('*')
            .eq('user_id', userId)
            .order('fecha_creacion', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }

    // ACTUALIZAR
    async updateTarea(id: number, tarea: { titulo?: string; descripcion?: string }) {
        const { data, error } = await this.supabaseClient
            .from('tareas')
            .update(tarea)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // ELIMINAR
    async deleteTarea(id: number) {
        const { error } = await this.supabaseClient
            .from('tareas')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // ELIMINACIÓN MASIVA
    async deleteAllTareas(userId: string) {
        const { error } = await this.supabaseClient
            .from('tareas')
            .delete()
            .eq('user_id', userId);
        
        if (error) throw error;
    }
}