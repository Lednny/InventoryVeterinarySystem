import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dashboard-almacen',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard-almacen.component.html',
  styleUrls: ['./dashboard-almacen.component.css'],
  standalone: true,
})
export class DashboardAlmacenComponent {
  selected = 1;
}
