import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.SUPABASE_URL,
      environment.SUPABASE_ANON_KEY
    );
  }

  async getProductosPorSucursal(idSucursal: number) {
    const { data, error } = await this.supabase
      .from('stock')
      .select('*, IdProducto(*), IdSucursal(*)')
      .eq('IdSucursal', idSucursal);

    if (error) throw error;
    return data;
  }

}
