export interface RmEntry {
  valor: number;
  fecha: string;
}
export interface Ejercicio {
  documentId?: string;
  ID_User: string;
  name: string;
  rm: string[];
  descripcion?: string;
}

export interface Entrenamiento{
  id?: string;
  nombre: string;
  descripcion: string;
  duracion?: string;
}

