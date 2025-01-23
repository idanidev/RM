import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { HeaderComponent } from '../../core/components/header/header.component';
import { RmListComponent } from '../../RMs/RM-list/rm-list.component';


@Component({
  selector: 'app-home',
  imports: [RmListComponent, HeaderComponent, FooterComponent, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
