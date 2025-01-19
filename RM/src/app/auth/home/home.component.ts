import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { HeaderComponent } from '../../core/components/header/header.component';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';
import { RmListComponent } from '../../RMs/RM-list/rm-list.component';


@Component({
  selector: 'app-home',
  imports: [RmListComponent, HeaderComponent, FooterComponent, SidebarModule, SidebarComponent, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  visibleSidebar: any;

}
