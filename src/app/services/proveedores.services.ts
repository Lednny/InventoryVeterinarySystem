import { Injectable, inject } from "@angular/core";
import { SupabaseService } from "./supabase.service";
import { BehaviorSubject } from 'rxjs';

interface Proveedor {
    id?: number;
    nombre?: string;
    telefono?: string;
    email?: string;
}

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
    private supabaseClient = inject(SupabaseService).supabaseClient;
    private proveedoresActualizadas = new BehaviorSubject<void>(undefined);
    proveedoresActualizadas$ = this.proveedoresActualizadas.asObservable();

    async getProveedores(): Promise<Proveedor[]> {
        const { data, error } = await this.supabaseClient
            .from('proveedores')
            .select('*');
        if (error) throw error;
        return data || [];
    }

    async addProveedor(proveedor: Proveedor) {
        const { data, error } = await this.supabaseClient
            .from('proveedores')
            .insert([proveedor])
            .select("*")
            .single();
        if (error) throw error;
        this.proveedoresActualizadas.next();
        return data;
    }

    async deleteProveedor(id: number) {
        const { error } = await this.supabaseClient
            .from('proveedores')
            .delete()
            .eq('id', id);
        if (error) throw error;
        this.proveedoresActualizadas.next();
    }

    async updateProveedor(id: number, proveedor: Proveedor) {
        const { data, error } = await this.supabaseClient
            .from('proveedores')
            .update(proveedor)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        this.proveedoresActualizadas.next();
        return data;
    }
}