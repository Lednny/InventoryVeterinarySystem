import { inject, Injectable } from "@angular/core";
import { SupabaseService } from "../../services/supabase.service";
import { SignInWithPasswordCredentials, SignUpWithPasswordCredentials} from "@supabase/supabase-js";
import { environment } from "../../../environments/environment";
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: "root"})
export class AuthService {

private _supabaseClient = inject(SupabaseService).supabaseClient;
private _authState = new BehaviorSubject<any>(null);
public authState$ = this._authState.asObservable();

    constructor(){
        this._supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event);
            console.log('Session:', session);
            this._authState.next(session);
            
            if (event === 'SIGNED_OUT') {
                console.log('Usuario desconectado');
                // Asegurar que el estado se limpie completamente
                this._authState.next(null);
            }
        })
    }
    session(){
        return this._supabaseClient.auth.getSession()
    }

    signUp(credentials: SignUpWithPasswordCredentials & {username: string}){
        console.log('Username', credentials.username)
        return this._supabaseClient.auth.signUp(credentials)
    }

    logIn(credentials: SignInWithPasswordCredentials){
            return this._supabaseClient.auth.signInWithPassword(credentials)
    }

    async signOut(){
        try {
            console.log('Iniciando logout...');
            
            // Primero limpiar el estado local
            localStorage.clear();
            sessionStorage.clear();
            
            // Luego cerrar sesión en Supabase
            const { error } = await this._supabaseClient.auth.signOut();
            
            if (error) {
                console.error('Error al cerrar sesión:', error);
                throw error;
            }
            
            console.log('Logout exitoso');
            return { error: null };
        } catch (error) {
            console.error('Error durante el logout:', error);
            // Incluso si hay error, limpiar localmente
            localStorage.clear();
            sessionStorage.clear();
            return { error };
        }
        }

    resetPassword(email: string){
        const resetUrl = (environment as any).BASE_URL + '/auth/reset';
        console.log('Reset URL being used:', resetUrl);
        console.log('Environment BASE_URL:', (environment as any).BASE_URL);
        return this._supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: resetUrl
        })
    }

    signInWithGoogle() {
        return this._supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: (environment as any).BASE_URL + '/dashboard'
            }
        });
    }
}