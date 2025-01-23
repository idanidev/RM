import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppwriteException } from 'appwrite';
import { account, ID } from '../interceptors/appwrite';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn = this.loggedIn.asObservable();
  
  constructor(private router: Router) { }

  async register(email: string, password: string, name: string): Promise<void> {
    try {
      if (!name || !email || !password) {
        return;
      }
      await account.create(ID.unique(), email, password, name);
      await this.login(email, password);
    } catch (error: any) {
      this.handleError(error);
      return; // Detiene la ejecución si ocurre un error
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      // Verificar si hay una sesión activa
      const session = await account.getSession('current');
      if (session) {
        // Si hay una sesión activa, eliminarla
        await account.deleteSession('current');
      }
    } catch (error: any) {
      // Si el error es 401, significa que no hay una sesión activa, lo cual es esperado
      if (error.code !== 401) {
        this.handleError(error);
        return;
      }
    }

    try {
      // Crear una nueva sesión
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
        // No hay sesión activa
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
    // Manejo de errores específico según la estructura del error
    if (error && error.message) {
      console.error(`Error: ${error.message}`);
      // Aquí puedes implementar lógica adicional para mostrar mensajes de error al usuario
    } else {
      console.error('Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.');
    }
  }
}
