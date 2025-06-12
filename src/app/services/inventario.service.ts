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
    const { data: inserted, error } = await this.supabase
    .from('stock')
    .insert([data])
    .select();
    if (error) throw error;
    return inserted;
  }

  //Metodo crud READ
  async getProductosBySucursal( 
    // Obtener los productos de la sucursal especificada
    IdSucursal: number,
    page: number = 1,
    pageSize: number = 10,
    searchFilter: string = '',
    IdAlmacen: number
  ) {
    let query = this.supabase
      .from('stock')
      .select('*, IdProducto(*), IdSucursal(*)')
      .eq('IdSucursal', IdSucursal)

      if(IdAlmacen !== undefined){
        query = query.eq('IdAlmacen', IdAlmacen);
      }

      if (searchFilter) {
        query = query.ilike('IdProducto.nombre', `%${searchFilter}%`);
      }

    const from = (page - 1) * pageSize;
    const to = page * pageSize - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if(error) throw error;
    return data;
  }

  //Metodo crud UPDATE
  async updateStock(id: number, newStock: number) {
    const { data: updated, error } = await this.supabase
      .from('stock')
      .update({ stock: newStock })
      .eq('id', id);
    if (error) throw error;
    return updated;
  }

  //Metodo crud DELETE
  async deleteRegistros(id: number) {
    const { data: deleted, error } = await this.supabase
      .from('stock')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return deleted;
  }

async getProductos() {
  const { data, error } = await this.supabase
    .from('almacen1')
    .select('*');
  if (error) throw error;
  return data;
}

async getProductosAlmacen2() {
  const { data, error } = await this.supabase
    .from('almacen2')
    .select('*');
  if (error) throw error;
  return data;
}
}
