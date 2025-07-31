import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entrenamiento } from '../../core/models/Ejercicio';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientosService {
  private readonly API_URL = 'https://all1fit-api.onrender.com/entrenamientos';

  constructor(private http: HttpClient) { }

  getEntrenamientos(): Observable<Entrenamiento[]> {
    return this.http.get<Entrenamiento[]>(this.API_URL);
  }

  crearEntrenamiento(entrenamiento: Entrenamiento): Observable<Entrenamiento> {
    return this.http.post<Entrenamiento>(this.API_URL, entrenamiento);
  }

  eliminarEntrenamiento(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  // (opcional) para futuros updates
  actualizarEntrenamiento(id: string, entrenamiento: Entrenamiento): Observable<Entrenamiento> {
    return this.http.put<Entrenamiento>(`${this.API_URL}/${id}`, entrenamiento);
  }
}
