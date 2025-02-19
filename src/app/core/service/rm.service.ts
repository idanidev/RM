import { Injectable } from '@angular/core';
import { Account, Client, Databases, ID, Models, Permission, Query, Role } from 'appwrite';
import { Ejercicio } from '../models/Ejercicio';

@Injectable({
    providedIn: 'root'
})
export class EjercicioService {
    private client: Client;
    private account: Account;
    private database: Databases;
    private databaseId: string = '677fe764003cce766b3f';
    private collectionId: string = '677fe76e002f45903aa9';

    constructor() {
        this.client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1') // Reemplaza con tu endpoint de Appwrite
            .setProject('677802c40031f81cd5b1');
        this.account = new Account(this.client);

        this.database = new Databases(this.client);
    }

    // Método para obtener el usuario actual
    async getCurrentUser() {
        try {
            const user = await this.account.get();
            return user;
        } catch (error) {
            console.error('Error al obtener el usuario actual:', error);
            throw error;
        }
    }

    async obtenerUsuarioActual(): Promise<Models.User<Models.Preferences> | null> {
        try {
            const user: Models.User<Models.Preferences> = await this.account.get();
            return user;
        } catch (error) {
            console.error('Error al obtener el usuario actual:', error);
            return null;
        }
    }

    async obtenerEjerciciosPorUsuario(ID_User: string) {
        try {
            const response = await this.database.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal('ID_User', ID_User)]
            );
            return response.documents;
        } catch (error) {
            console.error('Error al obtener ejercicios por usuario:', error);
            throw error;
        }
    }

    // Método para generar permisos
    generarPermisos(userId: string): string[] {
        return [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
        ];
    }

    // Método para crear un nuevo ejercicio
    async crearEjercicio(ejercicio: Ejercicio, userId: string) {
        const permisos = this.generarPermisos(userId);

        try {
            const response = await this.database.createDocument(
                this.databaseId,
                this.collectionId,
                ID.unique(),
                ejercicio,
                permisos
            );
            return response;
        } catch (error) {
            console.error('Error al crear el ejercicio:', error);
            throw error;
        }
    }

    async actualizarEjercicio(documentId: string, datosActualizados: Partial<Ejercicio>): Promise<void> {
        try {
            const response = await this.database.updateDocument(
                this.databaseId,
                this.collectionId,
                documentId,
                datosActualizados
            );
            console.log('Ejercicio actualizado con éxito:', response);
        } catch (error) {
            console.error('Error al actualizar el ejercicio:', error);
            throw error;
        }
    }


    async obtenerEjercicios(): Promise<Ejercicio[]> {
        try {
            const response = await this.database.listDocuments(
                this.databaseId,
                this.collectionId
            );

            // Mapear los documentos a la interfaz Ejercicio
            const ejercicios: Ejercicio[] = response.documents.map((a: any) => ({
                id: a.$id,
                name: a.name,
                rm: a.rm,
                ID_User: a.iduser
                // Mapear otros campos según sea necesario
            }));

            return ejercicios;
        } catch (error) {
            console.error('Error al obtener los ejercicios:', error);
            return [];
        }
    }

    async obtenerEjerciciosDelUsuario(ID_User: string) {
        try {
            const response = await this.database.listDocuments(
                this.databaseId,
                this.collectionId,
                [`equal("ID_User", "${ID_User}")`]
            );
            return response.documents;
        } catch (error) {
            console.error('Error al obtener los ejercicios:', error);
            throw error;
        }
    }

    eliminarEjercicio(id: string) {
        return this.database.deleteDocument(this.databaseId, this.collectionId, id);
    }
}
