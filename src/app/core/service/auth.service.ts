import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppwriteException } from 'appwrite';
import { account, ID } from '../interceptors/appwrite';
import { BehaviorSubject } from 'rxjs';
import { ErrorNotificationService } from './ErrorNotification.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedIn = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private errorService: ErrorNotificationService
  ) { }

  async register(email: string, password: string, name: string): Promise<void> {
    try {
      if (!name || !email || !password) return;
      await account.create(ID.unique(), email, password, name);
      await this.login(email, password);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const session = await account.getSession('current');
      if (session) {
        await account.deleteSession('current');
      }
    } catch (error: any) {
      if (error.code !== 401) {
        this.handleError(error);
        return;
      }
    }

    try {
      await account.createEmailPasswordSession(email, password);
      this.loggedIn.next(true);
      this.router.navigate(['/']);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      this.loggedIn.next(false);
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async checkSession(): Promise<void> {
    try {
      const user = await account.get();
      this.loggedIn.next(true);
      console.log('Sesión activa encontrada para el usuario:', user);
    } catch (error: any) {
      if (error.code === 401) {
        this.loggedIn.next(false);
        console.log('No se encontró una sesión activa.');
      } else {
        this.handleError(error);
      }
    }
  }

  getCurrentUser() {
    return account.get();
  }

  private handleError(error: AppwriteException): void {
    const defaultMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.';
    const detail = error?.message || defaultMessage;

    this.errorService.showError('Error', detail);
    console.error('Appwrite Error:', error);
  }
}
