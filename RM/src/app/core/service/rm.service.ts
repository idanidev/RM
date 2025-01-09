import { Injectable } from '@angular/core';
import { Client, Databases, ID } from 'appwrite';
import { Ejercicio } from '../models/Ejercicio';

@Injectable({
    providedIn: 'root'
})
export class EjercicioService {
    private client: Client;
    private database: Databases;
    private databaseId: string = '677fe764003cce766b3f';
    private collectionId: string = '677fe76e002f45903aa9';

    constructor() {
        this.client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1') // Reemplaza con tu endpoint de Appwrite
            .setProject('677802c40031f81cd5b1');

        this.database = new Databases(this.client);
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
                // Mapear otros campos según sea necesario
            }));

            return ejercicios;
        } catch (error) {
            console.error('Error al obtener los ejercicios:', error);
            return [];
        }
    }

    crearEjercicio(ejercicio: Ejercicio) {
        return this.database.createDocument(this.databaseId, this.collectionId, ID.unique(), ejercicio);
    }

    // actualizarEjercicio(ejercicio: Ejercicio) {
    //     if (ejercicio.id) {
    //         return this.database.updateDocument(this.databaseId, this.collectionId, ejercicio.id.toString(), ejercicio);
    //     } else {
    //         return Promise.reject(new Error('Ejercicio ID is required for update'));
    //     }
    // }

    eliminarEjercicio(id: string) {
        return this.database.deleteDocument(this.databaseId, this.collectionId, id);
    }
}
