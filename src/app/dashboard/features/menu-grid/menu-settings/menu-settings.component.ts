import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../../auth/data-access/auth.service';
import { SupabaseService } from '../../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { ElementRef, HostListener, ViewChild } from '@angular/core';


@Component({
  selector: 'app-menu-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './menu-settings.component.html',
  styleUrls: ['./menu-settings.component.css']
})
export class MenuSettingsComponent implements OnInit {

  @ViewChild('notificacionesDropdown') notificacionesDropdown!: ElementRef;
  @ViewChild('notificacionesBtn') notificacionesBtn!: ElementRef;
  @ViewChild('menuGridDropdown') menuGridDropdown!: ElementRef;
  @ViewChild('menuGridBtn') menuGridBtn!: ElementRef;
  @ViewChild('UserDropdown') UserDropdown!: ElementRef;
  @ViewChild('UserBtn') UserBtn!: ElementRef;
  //Varriables para Funcionalidades de la aplicación

  avatarUrl: string = '';
  firstName = '';
  email = '';
  //Variable para guardar la configuración de la aplicación
  settings: any = {};
  isLoading = true;
  errorMessage: string | null = null;

  //Variablas para insertar y gradar datos en supabase
  userId: string = '';
  private supabaseClient = inject(SupabaseService).supabaseClient;

  //Variables para Dropdown de botones de Notificaciones y GRID
  mostrarNotificaciones = false;
  mostrarMenuGrid = false;
  mostrarUserDropdown = false;

  constructor(
  private authService: AuthService,
  private router: Router
  ) {}

async ngOnInit() {
  const session = await this.authService.session();
  const user = session.data.session?.user;
  if (!user) {
    console.error('No se encontró el usuario en la sesión');
    window.location.href = '/auth/log-in';
    return;
  }
  const data = await this.ensureUsuario(user);
  if (data) {
    this.firstName = data.nombre;
    this.email = data.email;
    this.avatarUrl = data.avatar_url;
    this.userId = data.user_id;
  }
  this.loadSettings();
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

  async loadSettings() {
    const { data, error } = await this.supabaseClient
      .from('settings')
      .select('*')
      .single();
    if (error) {
      this.errorMessage = 'Error al cargar la configuración';
    } else {
      this.settings = data;
    }
    this.isLoading = false;
  }

  async saveSettings() {
    try {
      const { error } = await this.supabaseClient
        .from('settings')
        .update({
        //AÚN POR ARREGLAR LAS VARIABLES CORRECTAS PORQUE LOS DATOS NO SE GUARDAN EN LA TABLA settings DE SUPABASE, TOMAR COM REFERENCIA .TS DE MENU-PROFILE.
        })
        .eq('id', this.userId); // Asegúrate de que 'id' es la clave primaria de settings
      if (error) {
        alert(this.errorMessage = 'Error al guardar la configuración');
      } else {
        alert('Configuración guardada correctamente');
      }
    } catch (e) {
      this.errorMessage = 'Error inesperado al guardar la configuración';
    }
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
}
