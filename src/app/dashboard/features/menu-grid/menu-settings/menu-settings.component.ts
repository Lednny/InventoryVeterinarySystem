import { Component, OnInit } from '@angular/core';
import { SettingsService } from './settings.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-settings',
  templateUrl: './menu-settings.component.html',
  styleUrls: ['./menu-settings.component.css']
})
export class MenuSettingsComponent implements OnInit {
  settings: any = {};
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  async loadSettings() {
    const { data, error } = await this.settingsService.getSettings();
    if (error) {
      this.errorMessage = 'Error al cargar la configuración';
    } else {
      this.settings = data;
    }
    this.isLoading = false;
  }

  async saveSettings() {
    try {
      const { error } = await this.settingsService.updateSettings(this.settings);
      if (error) {
        alert(this.errorMessage = 'Error al guardar la configuración');
      } else {
        alert('Configuración guardada correctamente');
      }
    } catch (e) {
      this.errorMessage = 'Error inesperado al guardar la configuración';
    }
  }
}
