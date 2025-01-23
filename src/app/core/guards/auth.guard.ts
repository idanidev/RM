import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  async canActivate(): Promise<boolean> {
    try {
      await this.authService.getCurrentUser();
      return true;
    } catch {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
