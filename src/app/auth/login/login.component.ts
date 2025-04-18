import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';

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
    CardModule,
    PasswordModule,
    FloatLabelModule,
    RouterModule
  ]
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) { }

  onLogin() {
    this.authService.login(this.email, this.password)
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch(error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operación cancelada' });
        console.error('Error during login:', error);
      });
  }
}
