import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({providedIn: "root"})
export class SupabaseService {
    private static instance: SupabaseClient;
    
    get supabaseClient(): SupabaseClient {
        if (!SupabaseService.instance) {
            SupabaseService.instance = createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY);
        }
        return SupabaseService.instance;
    }

    constructor() {
        // El cliente se inicializa solo cuando se necesita
    }
        async saveUsername(userId: string, username: string) {
        return this.supabaseClient
            .from('profiles') // Asegúrate de tener una tabla llamada 'profiles'
            .insert({ id: userId, username });
    }

        signInWithGoogle() {
        return this.supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin // 
        }
        });
    }
}
