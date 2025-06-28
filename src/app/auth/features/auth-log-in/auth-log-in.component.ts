import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../data-access/auth.service';
import { SupabaseService } from '../../../services/supabase.service';
import { inject } from '@angular/core';
import { UserRoleService } from '../../../services/rol.services';

interface LogInForm {
  email: FormControl<null | string>;
  password: FormControl<null | string>;
}

@Component({
  selector: 'app-auth-log-in',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: `./auth-log-in.html`,
  styleUrl: './auth-log-in.component.css'
})

export default class AuthLogInComponent {

  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private supabaseClient = inject(SupabaseService).supabaseClient;
  private userRoleService = inject(UserRoleService);

  form = this._formBuilder.group<LogInForm>({
    email: this._formBuilder.control(null, [Validators.required, Validators.email]),
    password: this._formBuilder.control(null, [Validators.required,]),
  });

  async submit() {
    if (this.form.invalid) return;

    try{
    const {error, data}= await this._authService.logIn({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    });

      if (error) throw error;
      console.log('Login successful:', data);

      const session = await this._authService.session();
      const userId = session.data.session?.user?.id;
      if (!userId) {
        throw new Error('Sesión de usuario no encontrada.');
      }
      const { data: perfil } = await this.supabaseClient
        .from('usuarios')
        .select('rol')
        .eq('user_id', userId)
        .single();

      if (!perfil || !perfil.rol) {
        alert('No tienes un rol asignado. Contacta al administrador.');
        return;
      }

      this.userRoleService.setRole(perfil.rol);

      this._router.navigateByUrl('/dashboard');
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error during login:', error.message);
      }
      alert('Error al iniciar sesión, verifique su correo electrónico y/o contraseña.');
      this.form.controls.password.reset();
    }
  }

  async resetPassword() {
    if (this.form.value.email) {
      try {
        const { error } = await this._authService.resetPassword(this.form.value.email);
        if (error) throw error;
        alert('Se ha enviado un enlace de restablecimiento de contraseña a su correo electrónico.');
      } catch (error) {
        console.error('Error al enviar el enlace de restablecimiento de contraseña:', error);
        alert('Error al enviar el enlace de restablecimiento de contraseña. Por favor, inténtelo de nuevo más tarde.');
      }
    } else {
      (this.form.value.email === null || this.form.value.email === undefined) &&
      console.error('Email is required for password reset.');
      alert('Por favor, ingrese su correo electrónico para restablecer la contraseña.');
    }
  }
}
