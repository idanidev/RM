import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './core/components/header/header.component';
import { AuthService } from './core/service/auth.service';
import { LoaderService } from './core/service/loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(
    public authService: AuthService,
    public loaderService: LoaderService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loaderService.show();

    // Verificar sesión y ocultar loader
    this.authService.checkSession()
      .then(() => this.loaderService.hide())
      .catch(() => this.loaderService.hide());
  }

  isAuthRoute(): boolean {
    return this.router.url === '/login' || this.router.url === '/register';
  }
}
