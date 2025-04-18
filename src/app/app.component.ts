import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './core/service/auth.service';
import { LoaderService } from './core/service/loader.service';
import { HeaderComponent } from './core/components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  logeado: boolean = false;
  constructor(public authService: AuthService,
    public loaderService: LoaderService
  ) {

  }

  ngOnInit(): void {
    this.loaderService.show();
    this.authService.checkSession().then(() => {
      this.loaderService.hide();
    }).catch((error) => {
      this.loaderService.hide();
    });
  }
}
