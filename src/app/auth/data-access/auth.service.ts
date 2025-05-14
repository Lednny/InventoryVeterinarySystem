import { inject, Injectable } from "@angular/core";
import { SupabaseService } from "../../shared/data-access/supabase.service";
import { SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from "@supabase/supabase-js";

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

    signOut(){
        return this._supabaseClient.auth.signOut()
    }
}