import { effect, Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { account, ID } from '../interceptors/appwrite';
import { ErrorNotificationService } from './ErrorNotification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Signal para el estado de autenticación
  loggedIn: WritableSignal<boolean> = signal(false);

  constructor(
    private router: Router,
    private errorService: ErrorNotificationService
  ) {
    // Efecto para observar cambios en el estado de autenticación
    effect(() => {
      console.log('Estado de autenticación:', this.loggedIn());
    });
  }

  // Registro de usuario
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

  // Inicio de sesión
  async login(email: string, password: string): Promise<void> {
    try {
      await this.clearCurrentSession();
      await account.createEmailPasswordSession(email, password);
      this.loggedIn.set(true);
      this.router.navigate(['/']);
      this.errorService.showSuccess('Inicio de sesión exitoso', 'Has iniciado sesión correctamente.');
    } catch (error: any) {
      const detail = error?.message || 'Ocurrió un error inesperado al iniciar sesión.';
      this.errorService.showError('Error al iniciar sesión', detail);
      console.error('Appwrite Error:', error);
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      this.loggedIn.set(false);
      this.router.navigate(['/login']);
      this.errorService.showInfo('Sesión cerrada', 'Has cerrado sesión correctamente.');
    } catch (error: any) {
      const detail = error?.message || 'Ocurrió un error inesperado al cerrar sesión.';
      this.errorService.showError('Error al cerrar sesión', detail);
      console.error('Appwrite Error:', error);
    }
  }

  // Comprobar sesión actual
  async checkSession(): Promise<void> {
    try {
      const user = await account.get();
      this.loggedIn.set(true);
      console.log('Sesión activa encontrada para el usuario:', user);
    } catch (error: any) {
      if (error.code === 401) {
        this.loggedIn.set(false);
        console.log('No se encontró una sesión activa.');
      } else {
        const detail = error?.message || 'Ocurrió un error inesperado al verificar la sesión.';
        this.errorService.showError('Error al verificar la sesión', detail);
        console.error('Appwrite Error:', error);
      }
    }
  }

  // Obtener el usuario actual
  getCurrentUser() {
    return account.get();
  }

  // Limpiar la sesión actual
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
