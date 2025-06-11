import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({providedIn: "root"})
export class SupabaseService {
    supabaseClient: SupabaseClient;

    constructor() {
        this.supabaseClient = createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY);
    }
        async saveUsername(userId: string, username: string) {
        return this.supabaseClient
            .from('profiles') // Asegúrate de tener una tabla llamada 'profiles'
            .insert({ id: userId, username });
    }
    }
