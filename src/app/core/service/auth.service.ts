import { effect, Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Models } from 'appwrite';
import { account, ID } from '../interceptors/appwrite';
import { ErrorNotificationService } from './ErrorNotification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedIn: WritableSignal<boolean> = signal(false);
  user: WritableSignal<Models.User<{}> | null> = signal(null);

  isAdmin: WritableSignal<boolean> = signal(false);

  constructor(
    private router: Router,
    private errorService: ErrorNotificationService
  ) {
    effect(() => {
      console.log('Estado de autenticación:', this.loggedIn());
      console.log('Es admin:', this.isAdmin());
    });
  }

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
      await this.clearCurrentSession();
      await account.createEmailPasswordSession(email, password);
      const currentUser = await this.getCurrentUser();
      this.user.set(currentUser);
      this.loggedIn.set(true);

      await this.checkAdminStatus();

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
      this.loggedIn.set(false);
      this.isAdmin.set(false);
      this.user.set(null);
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
      this.loggedIn.set(true);
      this.user.set(user);

      // Verificar si es admin
      await this.checkAdminStatus();

      console.log('Sesión activa encontrada para el usuario:', user);
    } catch (error: any) {
      if (error.code === 401) {
        this.loggedIn.set(false);
        this.isAdmin.set(false);
        console.log('No se encontró una sesión activa.');
      } else {
        const detail = error?.message || 'Ocurrió un error inesperado al verificar la sesión.';
        this.errorService.showError('Error al verificar la sesión', detail);
        console.error('Appwrite Error:', error);
      }
    }
  }

  async checkAdminStatus(): Promise<void> {
    try {
      const user = await account.get();

      // Opción 1: Usando Labels (recomendado)
      const hasAdminLabel = user.labels?.includes('admin') || false;

      // Opción 2: Usando Preferences (alternativa)
      const hasAdminPref = user.prefs?.['isAdmin'] === true;

      // Usar cualquiera de las dos
      const admin = hasAdminLabel || hasAdminPref;

      this.isAdmin.set(admin);
      console.log('Estado admin:', admin);
    } catch (error) {
      this.isAdmin.set(false);
      console.error('Error verificando estado admin:', error);
    }
  }

  // Nuevo método público: obtener estado admin
  getAdminStatus(): boolean {
    return this.isAdmin();
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
