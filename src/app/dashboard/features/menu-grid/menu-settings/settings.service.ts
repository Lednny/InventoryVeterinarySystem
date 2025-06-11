import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY);

    async getSettings() {
    const { data, error } = await this.supabase.from('settings').select('*').single();
    return { data, error };
    }

    async updateSettings(updated: any) {
    const { data, error } = await this.supabase
        .from('settings')
        .update(updated)
      .eq('id', 1); // si es un registro único
    return { data, error };
    }
}
