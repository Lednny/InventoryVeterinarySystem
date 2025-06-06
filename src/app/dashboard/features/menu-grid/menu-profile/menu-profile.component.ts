import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
@Component({
  selector: 'app-menu-profile',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './menu-profile.component.html',
  styles: ``
})
export class MenuProfileComponent implements OnInit {
  @ViewChild('notificacionesDropdown') notificacionesDropdown!: ElementRef;
  @ViewChild('notificacionesBtn') notificacionesBtn!: ElementRef;
  @ViewChild('menuGridDropdown') menuGridDropdown!: ElementRef;
  @ViewChild('menuGridBtn') menuGridBtn!: ElementRef;
  @ViewChild('UserDropdown') UserDropdown!: ElementRef;
  @ViewChild('UserBtn') UserBtn!: ElementRef;
  //Varriables para Funcionalidades de la aplicación
  
  // Variables para las operaciones CRUD de tareas

  userId: string = '';
  private supabaseClient = inject(SupabaseService).supabaseClient;

  // Variables para el avatar del usuario
  avatarUrl: string = '';
  firstName = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  errorPassword: String = '';

  //Modal para eliminar cuenta
  mostrarModalEliminarCuenta = false;

  //Variables para Dropdown de botones de Notificaciones y GRID
  mostrarNotificaciones = false;
  mostrarMenuGrid = false;
  mostrarUserDropdown = false;

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

    // Usa el método ensureUsuario
    const data = await this.ensureUsuario(user);

    // Asigna los datos a las variables del componente
    if (data) {
      this.userId = data.user_id;
      this.firstName = data.nombre || '';
      this.email = data.email || '';
      this.avatarUrl = data.avatar_url || '';
    }
  }

  // Método para asegurar que el usuario existe en la base de datos
  private async ensureUsuario(user: any): Promise<any> {
    let { data } = await this.supabaseClient
      .from('usuarios')
      .select('user_id, nombre, email, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (!data) {
      await this.supabaseClient
        .from('usuarios')
        .insert([{
          user_id: user.id,
          nombre: user.user_metadata?.['nombre'] || '',
          email: user.email,
          avatar_url: user.user_metadata?.['avatar_url'] || ''
        }]);
      // Espera a que el registro esté disponible
      let retry = 0;
      while (!data && retry < 5) {
        await new Promise(res => setTimeout(res, 300));
        const result = await this.supabaseClient
          .from('usuarios')
          .select('user_id, nombre, email, avatar_url')
          .eq('user_id', user.id)
          .single();
        data = result.data;
        retry++;
      }
    }
    return data;
  }

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  // Notificaciones
  const notificacionesDropdown = this.notificacionesDropdown?.nativeElement;
  const notificacionesBtn = this.notificacionesBtn?.nativeElement;
  if (
    this.mostrarNotificaciones &&
    notificacionesDropdown && notificacionesBtn &&
    !notificacionesDropdown.contains(event.target) &&
    !notificacionesBtn.contains(event.target)
  ) {
    this.mostrarNotificaciones = false;
  }

  // Menu Grid
  const menuGridDropdown = this.menuGridDropdown?.nativeElement;
  const menuGridBtn = this.menuGridBtn?.nativeElement;
  if (
    this.mostrarMenuGrid &&
    menuGridDropdown && menuGridBtn &&
    !menuGridDropdown.contains(event.target) &&
    !menuGridBtn.contains(event.target)
  ) {
    this.mostrarMenuGrid = false;
  }
  
    // User Dropdown
  const userDropdown = this.UserDropdown?.nativeElement;
  const userBtn = this.UserBtn?.nativeElement;
  if (
    this.mostrarUserDropdown &&
    userDropdown && userBtn &&
    !userDropdown.contains(event.target) &&
    !userBtn.contains(event.target)
  ) {
    this.mostrarUserDropdown = false;
  }
}

async signOut() {
  await this.authService.signOut();
  window.location.href = '/auth/log-in'; // Fuerza recarga y navegación limpia
}

async obtenerAvatarUrl(event: any) {
  const file: File = event.target.files[0];
  if (!file) return;

  if (!this.userId) {
    alert('No se encontró el ID de usuario. Intenta recargar la página.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('El archivo es demasiado grande (máx 5MB)');
    return;
  }

  // 1. Elimina el avatar anterior si existe
  if (this.avatarUrl) {
    const url = this.avatarUrl.split('?')[0];
    const parts = url.split('/avatars/');
    if (parts.length === 2) {
      const oldFilePath = decodeURIComponent(parts[1]);
      await this.supabaseClient.storage
        .from('avatars')
        .remove([oldFilePath]);
    }
  }

  // 2. Sube el nuevo archivo
  const timestamp = Date.now();
  const filePath = `${this.userId}/${timestamp}_${file.name}`;

  const { error: uploadError } = await this.supabaseClient.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    alert('Error al subir foto de usuario: ' + uploadError.message);
    return;
  }

  // 3. Obtén la URL pública y actualiza la base de datos
  const { data: publicUrlData } = this.supabaseClient.storage
    .from('avatars')
    .getPublicUrl(filePath);

  this.avatarUrl = publicUrlData.publicUrl + '?t=' + new Date().getTime();

  const { error: updateError } = await this.supabaseClient
    .from('usuarios')
    .update({ avatar_url: this.avatarUrl })
    .eq('user_id', this.userId);

  if (updateError) {
    alert('Error al actualizar avatar en la base de datos: ' + updateError.message);
    return;
  }

  alert('Avatar actualizado correctamente');
}

async resetearAvatar(): Promise<void> {
  if (!this.userId) {
    alert('No se encontró el ID de usuario.');
    return;
  }

  // Elimina el archivo anterior del bucket si existe
  if (this.avatarUrl) {
    const url = this.avatarUrl.split('?')[0];
    const parts = url.split('/avatars/');
    if (parts.length === 2) {
      const oldFilePath = decodeURIComponent(parts[1]);
      const { error: storageError } = await this.supabaseClient.storage
        .from('avatars')
        .remove([oldFilePath]);
      if (storageError) {
        alert('Error al eliminar la imagen del bucket: ' + storageError.message);
        // Puedes continuar, solo avisa del error
      }
    }
  }

  // Limpia el campo en la base de datos
  const { error } = await this.supabaseClient
    .from('usuarios')
    .update({ avatar_url: '' })
    .eq('user_id', this.userId);

  if (error) {
    alert('Error al resetear avatar en la base de datos: ' + error.message);
    return;
  }

  // Limpia la variable local
  this.avatarUrl = '';
  alert('Avatar reseteado correctamente');
}

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  toggleMenuGrid() {
    this.mostrarMenuGrid = !this.mostrarMenuGrid;
    this.mostrarNotificaciones = false; // Cierra el menú del GRID si estaba abierto
  }

    toggleDropdownUser() {
    this.mostrarUserDropdown = !this.mostrarUserDropdown;
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

  if (!this.email || !this.firstName) {
    alert('El email y el nombre son obligatorios');
    return;
  }
  if (this.password && this.password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  const updates: any = {};
  if (this.email) updates.email = this.email;
  if (this.password) updates.password = this.password;
  alert('Verifique su correo electrónico para confirmar el cambio de email');

  const { error } = await this.supabaseClient.auth.updateUser(updates);
  if (error) {
    alert('Error al actualizar: ' + error.message);
  } else {
    alert('Usuario actualizado');
  }

  // Actualiza los datos en la tabla usuarios
  await this.supabaseClient
    .from('usuarios')
    .update({
      nombre: this.firstName,
      email: this.email,
      avatar_url: this.avatarUrl
    })
    .eq('user_id', this.userId);

  // Si el usuario cambió la contraseña, actualízala en Auth
  if (this.password) {
    await this.supabaseClient.auth.updateUser({
      password: this.password
    });
  }
  // Recarga la página para reflejar los cambios en el perfil
  window.location.reload();
}

// Método para mostrar el modal de eliminación de cuenta

  abrirModalEliminarCuenta() {
    this.mostrarModalEliminarCuenta = true;
  }

  cerrarModalEliminarCuenta() {
    this.mostrarModalEliminarCuenta = false;
  }

async confirmarEliminarCuenta() {
  // 1. Inserta la solicitud de eliminación
  await this.supabaseClient
    .from('solicitudes_eliminacion')
    .insert([{
      user_id: this.userId,
      email: this.email,
      fecha: new Date().toISOString()
    }]);

  // 2. Elimina el usuario de la tabla usuarios
  const { error } = await this.supabaseClient
    .from('usuarios')
    .delete()
    .eq('user_id', this.userId);

  if (error) {
    alert('Error al eliminar usuario: ' + error.message);
  } else {
    alert('Usuario eliminado correctamente');
            // 3. Cierra sesión
  await this.supabaseClient.auth.signOut();
    this.router.navigate(['auth/log-in']);
        // 3. Cierra sesión
  await this.supabaseClient.auth.signOut();
  }
}
}

