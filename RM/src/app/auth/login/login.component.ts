import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule
  ]
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.authService.login(this.email, this.password)
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch(error => {
        console.error('Error during login:', error);
      });
  }
}
