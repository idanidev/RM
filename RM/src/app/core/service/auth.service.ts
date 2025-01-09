import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppwriteException } from 'appwrite';
import { account, ID } from '../interceptors/appwrite';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  async register(email: string, password: string, name: string): Promise<void> {
    try {
      if (!name || !email || !password) {
        return;
      }
      const randomString = Math.random().toString(36).substring(2, 15);
      // const userId = `${username.replace(/[^a-zA-Z0-9.-_]/g, "").toLowerCase()}_${randomString}`

      await account.create(ID.unique(), email, password, name);
      await this.login(email, password);
    } catch (error: any) {
      this.handleError(error);
      return; // Detiene la ejecución si ocurre un error
    }
  }


  async login(email: string, password: string): Promise<void> {
    try {
      await account.createEmailPasswordSession(email, password);
      this.router.navigate(['/']);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.handleError(error);
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
