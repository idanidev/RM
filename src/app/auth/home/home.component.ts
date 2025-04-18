import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RmListComponent } from '../../RMs/RM-list/rm-list.component';


@Component({
  selector: 'app-home',
  imports: [RmListComponent, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
