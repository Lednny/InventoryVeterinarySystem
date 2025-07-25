import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../services/supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-profile',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './auth-reset.component.html',
  styles: ``
})
export class AuthResetComponent implements OnInit {
  
  // Variables para las operaciones CRUD de tareas

  userId: string = '';
  private supabaseClient = inject(SupabaseService).supabaseClient;

  // Variables para el avatar del usuari
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  errorPassword: String = '';

    constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const session = await this.authService.session();
    const user = session.data.session?.user;
    if (!user) {
      console.error('No se encontró el usuario en la sesión');
      window.location.href = '/auth/log-in';
      return;
    }
  }

async actualizarUsuario() {
  this.errorPassword = '';
  

  // Si el usuario quiere cambiar la contraseña, valida que coincidan
  if (this.password || this.confirmPassword) {
    if (this.password !== this.confirmPassword) {
      this.errorPassword = 'Las contraseñas no coinciden.';
      alert(this.errorPassword);
      return;
    }
  }

  if (this.password && this.password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  let error = null;
  if (this.password) {
    const result = await this.supabaseClient.auth.updateUser({ password: this.password });
    error = result.error;
  }
  if (error) {
    alert('Error al actualizar: ' + error.message);
  } else {
    alert('Usuario actualizado');
    
  }


  // Si el usuario cambió la contraseña, actualízala en Auth
  if (this.password) {
    await this.supabaseClient.auth.updateUser({
      password: this.password
    });
    await this.supabaseClient.auth.signOut();
    window.location.href = '/auth/log-in'; // Fuerza recarga y navegación limpia
  }
}
}

