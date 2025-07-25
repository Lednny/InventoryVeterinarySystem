import { inject, Injectable } from "@angular/core";
import { SupabaseService } from "../../services/supabase.service";
import { SignInWithPasswordCredentials, SignUpWithPasswordCredentials} from "@supabase/supabase-js";

@Injectable({providedIn: "root"})
export class AuthService {

private _supabaseClient = inject(SupabaseService).supabaseClient;

    constructor(){
        this._supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event)
            console.log('Session:', session)
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
        const result = await this._supabaseClient.auth.signOut();
        // Limpiar cualquier estado local si es necesario
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        return result;
    }

    resetPassword(email: string){
        return this._supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/auth/reset'
        })
    }

        signInWithGoogle() {
        return this._supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/dashboard' // o la ruta que prefieras después de login
        }
        });
    }
}