import { Component, OnInit, ErrorHandler, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './dashboard/animations/route-animations';
import { APP_VERSION } from '../version';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [slideInAnimation]
})
export class AppComponent implements OnInit{
  title = 'inventario-veterinario';
  version = APP_VERSION;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(){
    try {
      // Aplicar tema oscuro de forma segura
      this.initializeDarkTheme();
      
      // Inicializar Speed Insights de forma segura
      this.initializeSpeedInsights();
    } catch (error) {
      console.error('Error durante la inicialización de la aplicación:', error);
    }
  }

  private initializeDarkTheme() {
    try {
      if (typeof window !== 'undefined' && this.document) {
        this.document.documentElement.classList.add('dark');
        this.document.body.classList.add('bg-gray-900', 'text-white');
      }
    } catch (error) {
      console.warn('Error aplicando tema oscuro:', error);
    }
  }

  private initializeSpeedInsights() {
    try {
      // Verificar si estamos en un dispositivo móvil
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
      
      // Solo inicializar en producción, en navegador, y NO en móviles (temporalmente)
      if (isProduction && !isMobile) {
        // Usar setTimeout para evitar bloquear la inicialización de Angular
        setTimeout(() => {
          try {
            injectSpeedInsights();
            console.log('Speed Insights initialized successfully');
          } catch (error) {
            console.warn('Speed Insights initialization failed:', error);
          }
        }, 2000);
      } else if (isMobile) {
        console.log('Speed Insights disabled on mobile devices');
      }
    } catch (error) {
      console.warn('Speed Insights not available:', error);
    }
  }

    getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}


