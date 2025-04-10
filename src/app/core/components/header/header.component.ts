import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

  constructor(private authService: AuthService,) {
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

    this.items = [
      {
        label: 'Entrenamientos',
        items: [
          {
            label: 'RMs',
            icon: 'pi pi-home'
          },
          {
            label: 'Entrenamientos',
            icon: 'pi pi-stopwatch'
          }
        ]
      },
      {
        label: 'Profile',
        items: [
          {
            label: 'Settings',
            icon: 'pi pi-cog'
          },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out'
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
      // Aquí puedes agregar la lógica para enviar la imagen al servidor
    };
  }

  showUploadDialog() {
    this.displayUploadDialog = true;
  }
}