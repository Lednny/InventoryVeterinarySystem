import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { Router, RouterModule} from '@angular/router';
import { AuthService } from '../../../auth/data-access/auth.service';

@Component({
  selector: 'app-dashboard-list',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.css'],
  standalone: true,
  
})
export default class DashboardListComponent {
  showDropdown = false;

  constructor(private router: Router, 
  private authService: AuthService) {}

  async signOut() {
    this.showDropdown = false;
    await this.authService.signOut();
    this.router.navigate(['auth/log-in']);
  }
}
