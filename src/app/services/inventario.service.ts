import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.SUPABASE_URL,
      environment.SUPABASE_ANON_KEY
    );
  }

  //Metodo crud CREATE
  async addProducto(data: {
    IdProducto: number;
    IdSucursal: number;
    IdAlmacen: number;
    stock: number;
  }) {
    const { error } = await this.supabase.from('stock').insert([data]);
    if (error) throw error;
  }

  //Metodo crud READ
  async getProductosBySucursal(IdSucursal: number) {
    const { data, error } = await this.supabase
      .from('stock')
      .select('*, IdProducto(*), IdSucursal(*)')
      .eq('IdSucursal', IdSucursal);
    if (error) throw error;
    return data;
  }

  //Metodo crud UPDATE
  async updateStock(id: number, newStock: number) {
    const { error } = await this.supabase
      .from('stock')
      .update({ stock: newStock })
      .eq('IdProducto', id);
    if (error) throw error;
  }

  //Metodo crud DELETE
  async deleteRegistros(id: number) {
    const { error } = await this.supabase.from('stock').delete().eq('id', id);
    if (error) throw error;
  }
}
