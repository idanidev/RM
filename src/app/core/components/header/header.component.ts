import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { AuthService } from '../../service/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, ButtonModule, SidebarModule, SidebarComponent, DrawerModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  visibleSidebar: any;
  drawerVisible: boolean = false;
  darkMode: boolean = true;
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

  toggleDrawer() {
    this.drawerVisible = !this.drawerVisible;
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
  }
  openSettings() {
    console.log('Abrir ajustes');
  }
}