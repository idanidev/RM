import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RmListComponent } from '../../RMs/RM-list/rm-list.component';
import { AuthService } from '../../core/service/auth.service';


@Component({
  selector: 'app-home',
  imports: [RmListComponent, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(private authservice: AuthService) { }

  ngOnInit(): void {
    this.authservice.checkSession();
  }
}
