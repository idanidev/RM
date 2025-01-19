import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule,ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  items: MenuItem[];

  constructor() {
    this.items = [
      { 
        label: '',
        icon: 'pi pi-bars',
        command: () => {
          // Lógica para abrir/cerrar el sidenav
        }
      },
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
    // Lógica para cerrar sesión
  }
}