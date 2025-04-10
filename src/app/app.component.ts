import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './core/service/auth.service';
import { LoaderService } from './core/service/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService,
    public loaderService: LoaderService
  ) {

  }

  ngOnInit(): void {
    this.loaderService.show(); // Activa el spinner
    this.authService.checkSession().then(() => {
      // Lógica adicional si la sesión es válida
      this.loaderService.hide(); // Desactiva el spinner
    }).catch((error) => {
      // Manejo de errores si la verificación de sesión falla
      this.loaderService.hide(); // Desactiva el spinner
      // Opcional: redirigir al login u otra acción
    });
  }
}
