import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { AuthService } from '../../service/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, ButtonModule, SidebarModule, SidebarComponent,],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  visibleSidebar: any;

  items: MenuItem[];

  constructor(private authService: AuthService,) {
    this.items = [
      // {
      //   label: '',
      //   icon: 'pi pi-bars',
      //   command: () => {
      //     // Lógica para abrir/cerrar el sidenav
      //   }
      // },
      // {
      //   label: 'Cerrar sesión',
      //   icon: 'pi pi-sign-out',
      //   command: () => {
      //     this.logout();
      //   }
      // }
    ];
  }

  logout() {
    this.authService.logout();
  }
}