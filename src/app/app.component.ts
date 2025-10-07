import { Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './dashboard/animations/route-animations';
import { APP_VERSION } from '../version';
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

  ngOnInit(){
    injectSpeedInsights();

    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-gray-900', 'text-white');
  }

    getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}


