import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InventoryService } from './services/inventario.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'inventario-veterinario';

  productos: any[] = [];

  constructor(private supabaseService: InventoryService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  async cargarProductos() {
    try {
      this.productos = await this.supabaseService.getProductosPorSucursal(1);
    } catch (error) {
      console.error('Error cargando productos:', (error as any).message);
    }
  }
}
