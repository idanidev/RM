import { Component } from '@angular/core';
import { RmListComponent } from '../../RMs/RM-list/rm-list.component';

@Component({
  selector: 'app-home',
  imports: [RmListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
