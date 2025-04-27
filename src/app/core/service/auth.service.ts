import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { account, ID } from '../interceptors/appwrite';
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
    if (!name || !email || !password) {
      this.errorService.showWarn('Registro incompleto', 'Por favor, completa todos los campos.');
      return;
    }

    try {
      await account.create(ID.unique(), email, password, name);
      await this.login(email, password);
      this.errorService.showSuccess('Registro exitoso', 'Te has registrado correctamente.');
    } catch (error: any) {
      const detail = error?.message || 'Ocurrió un error inesperado al registrarse.';
      this.errorService.showError('Error al registrarse', detail);
      console.error('Appwrite Error:', error);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      // Elimina cualquier sesión existente antes de iniciar una nueva
      await this.clearCurrentSession();

      // Crea una nueva sesión
      await account.createEmailPasswordSession(email, password);
      this.loggedIn.next(true);
      this.router.navigate(['/']);
      this.errorService.showSuccess('Inicio de sesión exitoso', 'Has iniciado sesión correctamente.');
    } catch (error: any) {
      const detail = error?.message || 'Ocurrió un error inesperado al iniciar sesión.';
      this.errorService.showError('Error al iniciar sesión', detail);
      console.error('Appwrite Error:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      this.loggedIn.next(false);
      this.router.navigate(['/login']);
      this.errorService.showInfo('Sesión cerrada', 'Has cerrado sesión correctamente.');
    } catch (error: any) {
      const detail = error?.message || 'Ocurrió un error inesperado al cerrar sesión.';
      this.errorService.showError('Error al cerrar sesión', detail);
      console.error('Appwrite Error:', error);
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
        const detail = error?.message || 'Ocurrió un error inesperado al verificar la sesión.';
        this.errorService.showError('Error al verificar la sesión', detail);
        console.error('Appwrite Error:', error);
      }
    }
  }

  getCurrentUser() {
    return account.get();
  }

  private async clearCurrentSession(): Promise<void> {
    try {
      const session = await account.getSession('current');
      if (session) {
        await account.deleteSession('current');
      }
    } catch (error: any) {
      if (error.code !== 401) {
        const detail = error?.message || 'No se pudo limpiar la sesión actual.';
        this.errorService.showError('Error al limpiar sesión', detail);
        console.error('Appwrite Error:', error);
      }
    }
  }
}