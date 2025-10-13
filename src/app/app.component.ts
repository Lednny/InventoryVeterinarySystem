import { Component, OnInit, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './dashboard/animations/route-animations';
import { APP_VERSION } from '../version';
import { DOCUMENT } from '@angular/common';
import { injectSpeedInsights } from '@vercel/speed-insights';
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
      // Solo inicializar en el navegador
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          try {
            injectSpeedInsights();
            console.log('Speed Insights inicializado correctamente');
          } catch (error) {
            console.warn('Error al inicializar Speed Insights:', error);
          }
        }, 1000);
      }
    } catch (error) {
      console.warn('Speed Insights no disponible:', error);
    }
  }

  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}


