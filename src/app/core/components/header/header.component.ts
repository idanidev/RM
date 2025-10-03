import { CommonModule } from '@angular/common';
import { Component, computed, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { FileUploadModule } from 'primeng/fileupload';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, MenuModule, AvatarModule, CommonModule, OverlayBadgeModule, ButtonModule, DrawerModule, DialogModule, FileUploadModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  drawerVisible: boolean = false;
  darkMode: boolean = true;
  profilePictureUrl: string = '';
  displayUploadDialog: boolean = false;
  items: MenuItem[] | undefined;
  nombreUsuario = computed(() => this.authService.user()?.name ?? '');

  // Nuevo: computed para el estado admin
  isAdmin = computed(() => this.authService.isAdmin());

  constructor(private authService: AuthService) {
    this.profilePictureUrl = 'assets/images/profile.png';
  }

  ngOnInit() {
    const savedDarkMode = localStorage.getItem('darkMode');
    this.darkMode = savedDarkMode ? JSON.parse(savedDarkMode) : false;

    const element = document.querySelector('html');
    if (this.darkMode) {
      element?.classList.add('my-app-dark');
    } else {
      element?.classList.remove('my-app-dark');
    }

    this.buildMenuItems();
  }

  buildMenuItems() {
    this.items = [
      {
        label: 'Entrenamientos',
        items: [
          {
            label: 'RMs',
            icon: 'pi pi-chart-line',
            routerLink: ['/home'],
            command: () => this.drawerVisible = false
          },
          {
            label: 'Entrenamientos',
            icon: 'pi pi-stopwatch',
            routerLink: ['/entrenamientos'],
            command: () => this.drawerVisible = false,
            disabled: !this.isAdmin(), // Habilitado solo para admins
            visible: this.isAdmin() // Mostrar solo si es admin
          },
          {
            label: 'GYM',
            icon: 'pi pi-calendar',
            routerLink: ['/gym'],
            command: () => this.drawerVisible = false,
            disabled: !this.isAdmin(), // Habilitado solo para admins
            visible: this.isAdmin() // Mostrar solo si es admin
          }
        ]
      },
      {
        label: 'Profile',
        items: [
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            disabled: true,
          },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.logout()
          }
        ]
      }
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

    if (this.darkMode) {
      element?.classList.add('my-app-dark');
    } else {
      element?.classList.remove('my-app-dark');
    }

    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
  }

  openSettings() {
    console.log('Abrir ajustes');
  }

  onUpload(event: any) {
    const file = event.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.profilePictureUrl = reader.result as string;
      this.displayUploadDialog = false;
    };
  }

  showUploadDialog() {
    this.displayUploadDialog = true;
  }
}
