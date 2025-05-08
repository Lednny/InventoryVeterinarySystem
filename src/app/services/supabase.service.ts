import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() { 
      this.supabase = createClient('https://umphhhpeyguzpngdcyht.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcGhoaHBleWd1enBuZ2RjeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzA4OTgsImV4cCI6MjA2MTcwNjg5OH0.yglWzoHjNJOSe2CllUHD3MT941mUvPnfiWKBNqQ9GdM');
    }
  
    getProducts() {
      return this.supabase.from('productos').select('*');
    }
  }
