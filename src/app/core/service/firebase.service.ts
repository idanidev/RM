import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, getDoc, setDoc, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { AuthService } from './auth.service';

// Configuración de Firebase - Reemplaza con tus credenciales
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Verificar si Firebase está configurado
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                              firebaseConfig.projectId !== "YOUR_PROJECT_ID";

// Inicializar Firebase solo si está configurado
let app: any = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Error al inicializar Firebase:', error);
    db = null;
  }
}

export interface EjercicioEntrenamiento {
  id?: string;
  nombre: string;
  series: number;
  repeticiones: string;
  peso?: number;
  descanso?: number; // en segundos
  notas?: string;
  completado?: boolean;
}

export interface DiaEntrenamientoFirebase {
  id?: string;
  userId: string;
  fecha: string; // ISO string
  grupos: string[];
  ejercicios: EjercicioEntrenamiento[];
  completado: boolean;
  notas?: string;
}

export interface PlanEntrenamiento {
  id?: string;
  userId: string;
  gruposSeleccionados: string[];
  tipoSeleccion: 'dias-especificos' | 'cantidad-dias';
  diasSemanaSeleccionados: number[];
  cantidadDias: number;
  duracionMeses: number;
  rutinaPartida: boolean;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db: Firestore | null;
  private isConfigured: boolean;

  constructor(private authService: AuthService) {
    this.db = db;
    this.isConfigured = isFirebaseConfigured && db !== null;
  }

  private checkFirebaseConfigured(): void {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firebase no está configurado');
    }
  }

  private getUserId(): string {
    try {
      const user = this.authService.user();
      if (!user || !user.$id) {
        throw new Error('Usuario no autenticado');
      }
      return user.$id;
    } catch (error) {
      // Si no hay usuario, también lanzar error para usar datos dummy
      throw new Error('Usuario no autenticado');
    }
  }

  // ============= PLAN DE ENTRENAMIENTO =============
  async guardarPlan(plan: Omit<PlanEntrenamiento, 'id' | 'userId' | 'fechaCreacion'>): Promise<string> {
    this.checkFirebaseConfigured();
    const userId = this.getUserId();
    const planRef = doc(collection(this.db!, 'planes'));
    
    const planData: PlanEntrenamiento = {
      ...plan,
      id: planRef.id,
      userId,
      fechaCreacion: new Date().toISOString()
    };

    await setDoc(planRef, planData);
    return planRef.id;
  }

  async obtenerPlan(): Promise<PlanEntrenamiento | null> {
    this.checkFirebaseConfigured();
    try {
      const userId = this.getUserId();
      const q = query(collection(this.db!, 'planes'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as PlanEntrenamiento;
    } catch (error: any) {
      // Si Firebase no está configurado o hay error, lanzar excepción
      throw new Error('Firebase no configurado o error de conexión');
    }
  }

  // ============= DÍAS DE ENTRENAMIENTO =============
  async guardarDiaEntrenamiento(dia: Omit<DiaEntrenamientoFirebase, 'id' | 'userId'>): Promise<string> {
    this.checkFirebaseConfigured();
    const userId = this.getUserId();
    const fechaKey = new Date(dia.fecha).toISOString().split('T')[0]; // YYYY-MM-DD
    const diaRef = doc(this.db!, 'entrenamientos', `${userId}_${fechaKey}`);
    
    const diaData: DiaEntrenamientoFirebase = {
      ...dia,
      id: diaRef.id,
      userId
    };

    await setDoc(diaRef, diaData);
    return diaRef.id;
  }

  async obtenerDiaEntrenamiento(fecha: Date): Promise<DiaEntrenamientoFirebase | null> {
    this.checkFirebaseConfigured();
    const userId = this.getUserId();
    const fechaKey = fecha.toISOString().split('T')[0];
    const diaRef = doc(this.db!, 'entrenamientos', `${userId}_${fechaKey}`);
    const diaSnap = await getDoc(diaRef);

    if (!diaSnap.exists()) {
      return null;
    }

    return { id: diaSnap.id, ...diaSnap.data() } as DiaEntrenamientoFirebase;
  }

  async obtenerEntrenamientosRango(fechaInicio: Date, fechaFin: Date): Promise<DiaEntrenamientoFirebase[]> {
    this.checkFirebaseConfigured();
    const userId = this.getUserId();
    const entrenamientos: DiaEntrenamientoFirebase[] = [];
    
    const fechaInicioKey = fechaInicio.toISOString().split('T')[0];
    const fechaFinKey = fechaFin.toISOString().split('T')[0];

    // Obtener todos los entrenamientos del usuario
    const q = query(collection(this.db!, 'entrenamientos'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as DiaEntrenamientoFirebase;
      const fechaEntrenamiento = new Date(data.fecha).toISOString().split('T')[0];
      
      if (fechaEntrenamiento >= fechaInicioKey && fechaEntrenamiento <= fechaFinKey) {
        entrenamientos.push(data);
      }
    });

    return entrenamientos.sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
  }

  async actualizarDiaEntrenamiento(id: string, updates: Partial<DiaEntrenamientoFirebase>): Promise<void> {
    this.checkFirebaseConfigured();
    const diaRef = doc(this.db!, 'entrenamientos', id);
    await updateDoc(diaRef, updates as any);
  }

  async eliminarDiaEntrenamiento(id: string): Promise<void> {
    this.checkFirebaseConfigured();
    const diaRef = doc(this.db!, 'entrenamientos', id);
    await deleteDoc(diaRef);
  }

  // ============= EJERCICIOS =============
  async agregarEjercicioADia(diaId: string, ejercicio: Omit<EjercicioEntrenamiento, 'id'>): Promise<string> {
    this.checkFirebaseConfigured();
    const diaRef = doc(this.db!, 'entrenamientos', diaId);
    const diaSnap = await getDoc(diaRef);

    if (!diaSnap.exists()) {
      throw new Error('Día de entrenamiento no encontrado');
    }

    const diaData = diaSnap.data() as DiaEntrenamientoFirebase;
    const ejercicioId = `ej_${Date.now()}`;
    const ejercicioCompleto: EjercicioEntrenamiento = {
      ...ejercicio,
      id: ejercicioId,
      completado: false
    };

    diaData.ejercicios = [...(diaData.ejercicios || []), ejercicioCompleto];
    await updateDoc(diaRef, { ejercicios: diaData.ejercicios });

    return ejercicioId;
  }

  async actualizarEjercicio(diaId: string, ejercicioId: string, updates: Partial<EjercicioEntrenamiento>): Promise<void> {
    this.checkFirebaseConfigured();
    const diaRef = doc(this.db!, 'entrenamientos', diaId);
    const diaSnap = await getDoc(diaRef);

    if (!diaSnap.exists()) {
      throw new Error('Día de entrenamiento no encontrado');
    }

    const diaData = diaSnap.data() as DiaEntrenamientoFirebase;
    const ejercicios = diaData.ejercicios.map(ej => 
      ej.id === ejercicioId ? { ...ej, ...updates } : ej
    );

    await updateDoc(diaRef, { ejercicios });
  }

  async eliminarEjercicio(diaId: string, ejercicioId: string): Promise<void> {
    this.checkFirebaseConfigured();
    const diaRef = doc(this.db!, 'entrenamientos', diaId);
    const diaSnap = await getDoc(diaRef);

    if (!diaSnap.exists()) {
      throw new Error('Día de entrenamiento no encontrado');
    }

    const diaData = diaSnap.data() as DiaEntrenamientoFirebase;
    const ejercicios = diaData.ejercicios.filter(ej => ej.id !== ejercicioId);

    await updateDoc(diaRef, { ejercicios });
  }
}

