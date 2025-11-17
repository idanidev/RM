import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { FirebaseService, DiaEntrenamientoFirebase, EjercicioEntrenamiento, PlanEntrenamiento } from '../../service/firebase.service';
import { AuthService } from '../../service/auth.service';
import { TimerComponent } from '../components/timer/timer.component';

// ============= TIPOS E INTERFACES =============
type TipoVista = 'semanal' | 'mensual';
type TipoSeleccion = 'dias-especificos' | 'cantidad-dias';

interface GrupoMuscular {
  nombre: string;
  nombreCorto: string;  // Añadido para responsive
  code: string;
  color: string;
}

interface DiaEntrenamiento {
  fecha: Date;
  grupos: string[];
  completado: boolean;
  ejercicios?: EjercicioEntrenamiento[];
  id?: string;
}

interface DiaSemana {
  nombre: string;
  nombreCorto: string;  // Añadido para responsive
  valor: number;
}

// ============= CONSTANTES =============
const GRUPOS_MUSCULARES: GrupoMuscular[] = [
  { nombre: 'Pecho', nombreCorto: 'PE', code: 'PECHO', color: '#ef4444' },
  { nombre: 'Espalda', nombreCorto: 'ES', code: 'ESPALDA', color: '#3b82f6' },
  { nombre: 'Piernas', nombreCorto: 'PI', code: 'PIERNAS', color: '#8b5cf6' },
  { nombre: 'Hombros', nombreCorto: 'HO', code: 'HOMBROS', color: '#f59e0b' },
  { nombre: 'Brazos', nombreCorto: 'BR', code: 'BRAZOS', color: '#10b981' },
  { nombre: 'Core', nombreCorto: 'CO', code: 'CORE', color: '#ec4899' },
  { nombre: 'Cardio', nombreCorto: 'CA', code: 'CARDIO', color: '#06b6d4' }
];

const DIAS_SEMANA_CORTOS: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DIAS_SEMANA_COMPLETOS: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const DIAS_SEMANA_OPCIONES: DiaSemana[] = [
  { nombre: 'Lunes', nombreCorto: 'Lun', valor: 1 },
  { nombre: 'Martes', nombreCorto: 'Mar', valor: 2 },
  { nombre: 'Miércoles', nombreCorto: 'Mié', valor: 3 },
  { nombre: 'Jueves', nombreCorto: 'Jue', valor: 4 },
  { nombre: 'Viernes', nombreCorto: 'Vie', valor: 5 },
  { nombre: 'Sábado', nombreCorto: 'Sáb', valor: 6 },
  { nombre: 'Domingo', nombreCorto: 'Dom', valor: 0 }
];

const OPCIONES_DIAS: number[] = [2, 3, 4, 5, 6, 7];
const OPCIONES_MESES: number[] = [1, 2, 3, 4, 5, 6];
const DIAS_POR_MES = 30;
const DIAS_EN_SEMANA = 7;

@Component({
  selector: 'app-gym',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    DialogModule,
    DrawerModule,
    MultiSelectModule,
    SelectModule,
    ToastModule,
    InputTextModule,
    InputTextarea,
    InputNumberModule,
    TimerComponent
  ],
  templateUrl: './gym.component.html',
  styleUrl: './gym.component.scss',
  providers: [MessageService]
})
export class GymComponent implements OnInit {
  // ============= PROPIEDADES READONLY =============
  readonly gruposMusculares = GRUPOS_MUSCULARES;
  readonly diasSemana = DIAS_SEMANA_COMPLETOS;
  readonly diasSemanaCortos = DIAS_SEMANA_CORTOS;
  readonly diasSemanaOpciones = DIAS_SEMANA_OPCIONES;
  readonly opcionesDias = OPCIONES_DIAS;
  readonly opcionesMeses = OPCIONES_MESES;

  // ============= ESTADO DE VISTA =============
  vistaActual: TipoVista = 'semanal';
  fechaSeleccionada = new Date();
  mostrarConfiguracion = false;
  mostrarDetalleDialog = false;
  mostrarEjerciciosDrawer = false;
  diaSeleccionado: DiaEntrenamiento | null = null;
  fechaDiaSeleccionado: Date | null = null;
  ejerciciosDelDia: EjercicioEntrenamiento[] = [];
  ejercicioEditando: EjercicioEntrenamiento | null = null;
  mostrarFormEjercicio = false;
  ejercicioActualIndex = 0;
  ejercicioActual: EjercicioEntrenamiento | null = null;

  // ============= CONFIGURACIÓN DEL PLAN =============
  gruposSeleccionados: GrupoMuscular[] = [];
  tipoSeleccion: TipoSeleccion = 'cantidad-dias';
  diasSemanaSeleccionados: number[] = [];
  cantidadDias = 4;
  duracionMeses = 1;
  rutinaPartida = false;
  planConfigurado = false;

  // ============= DATOS =============
  entrenamientos: DiaEntrenamiento[] = [];
  planId: string | null = null;
  cargando = false;

  constructor(
    private messageService: MessageService,
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  // ============= INICIALIZACIÓN =============
  private async inicializarComponente(): Promise<void> {
    this.cargando = true;
    try {
      await this.cargarConfiguracion();
      if (this.planConfigurado) {
        await this.cargarEntrenamientos();
      } else {
        // Cargar datos dummy para ver el diseño
        this.cargarDatosDummy();
      }
    } catch (error) {
      console.error('Error al inicializar:', error);
      // Si hay error, cargar datos dummy
      this.cargarDatosDummy();
    } finally {
      this.cargando = false;
    }
  }

  private async cargarConfiguracion(): Promise<void> {
    try {
      // Verificar si Firebase está configurado (si no, lanzará error)
      const plan = await this.firebaseService.obtenerPlan();
      if (plan) {
        this.planId = plan.id || null;
        this.gruposSeleccionados = plan.gruposSeleccionados
          .map(code => this.gruposMusculares.find(g => g.code === code))
          .filter((g): g is GrupoMuscular => g !== undefined);
        this.tipoSeleccion = plan.tipoSeleccion;
        this.diasSemanaSeleccionados = plan.diasSemanaSeleccionados;
        this.cantidadDias = plan.cantidadDias;
        this.duracionMeses = plan.duracionMeses;
        this.rutinaPartida = plan.rutinaPartida;
        this.planConfigurado = true;
      } else {
        this.planConfigurado = false;
      }
    } catch (error: any) {
      // Si hay error (Firebase no configurado o error de conexión), usar datos dummy
      console.log('Firebase no configurado o error, usando datos dummy:', error?.message || error);
      this.planConfigurado = false;
      // Lanzar el error para que se capture en inicializarComponente
      throw error;
    }
  }

  // ============= DATOS DUMMY PARA DISEÑO =============
  private cargarDatosDummy(): void {
    // Configurar plan dummy
    this.gruposSeleccionados = [
      this.gruposMusculares[0], // Pecho
      this.gruposMusculares[1], // Espalda
      this.gruposMusculares[2], // Piernas
      this.gruposMusculares[3]  // Hombros
    ];
    this.tipoSeleccion = 'cantidad-dias';
    this.cantidadDias = 4;
    this.duracionMeses = 1;
    this.rutinaPartida = false;
    this.planConfigurado = true;

    // Generar entrenamientos dummy para la semana actual
    const hoy = new Date();
    const semana = this.obtenerSemanaActual();

    const entrenamientosDummy: DiaEntrenamiento[] = [];

    semana.forEach((dia, index) => {
      // Lunes, Miércoles, Viernes y Sábado tienen entrenamiento
      const tieneEntrenamiento = [1, 3, 5, 6].includes(dia.getDay());

      if (tieneEntrenamiento) {
        const grupos = this.obtenerGruposDummy(dia.getDay());
        const ejercicios = this.obtenerEjerciciosDummy(grupos);

        entrenamientosDummy.push({
          fecha: dia,
          grupos: grupos,
          completado: index === 0, // El primer día está completado
          ejercicios: ejercicios,
          id: `dummy_${dia.toISOString().split('T')[0]}`
        });
      }
    });

    this.entrenamientos = entrenamientosDummy;
  }

  private obtenerGruposDummy(diaSemana: number): string[] {
    const gruposPorDia: { [key: number]: string[] } = {
      1: ['PECHO', 'BRAZOS'],       // Lunes - Pecho y Brazos
      3: ['ESPALDA', 'BRAZOS'],     // Miércoles - Espalda y Brazos
      5: ['PIERNAS', 'CORE'],       // Viernes - Piernas y Core
      6: ['HOMBROS', 'CORE']        // Sábado - Hombros y Core
    };
    return gruposPorDia[diaSemana] || ['PECHO'];
  }

  private obtenerEjerciciosDummy(grupos: string[]): EjercicioEntrenamiento[] {
    const ejerciciosPorGrupo: { [key: string]: string[] } = {
      'PECHO': ['Press de banca', 'Press inclinado con mancuernas', 'Aperturas'],
      'BRAZOS': ['Curl de bíceps', 'Extensiones de tríceps', 'Curl martillo'],
      'ESPALDA': ['Dominadas', 'Remo con barra', 'Jalones al pecho'],
      'PIERNAS': ['Sentadillas', 'Prensa de piernas', 'Extensiones de cuádriceps'],
      'HOMBROS': ['Press militar', 'Elevaciones laterales', 'Elevaciones frontales'],
      'CORE': ['Plancha', 'Abdominales', 'Mountain climbers'],
      'CARDIO': ['Correr', 'Bicicleta', 'Elíptica']
    };

    const ejercicios: EjercicioEntrenamiento[] = [];

    grupos.forEach((grupo, grupoIndex) => {
      const nombresEjercicios = ejerciciosPorGrupo[grupo] || ['Ejercicio genérico'];

      nombresEjercicios.forEach((nombre, ejercicioIndex) => {
        ejercicios.push({
          id: `ej_dummy_${grupoIndex}_${ejercicioIndex}`,
          nombre: nombre,
          series: 3 + ejercicioIndex,
          repeticiones: grupoIndex === 0 ? '10-12' : '8-10',
          peso: 20 + (ejercicioIndex * 10),
          descanso: 60 + (ejercicioIndex * 15),
          notas: ejercicioIndex === 0 ? 'Última serie al fallo' : undefined,
          completado: grupoIndex === 0 && ejercicioIndex === 0
        });
      });
    });

    return ejercicios;
  }

  private async cargarEntrenamientos(): Promise<void> {
    try {
      const fechaInicio = new Date(this.fechaSeleccionada);
      fechaInicio.setDate(1);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setMonth(fechaFin.getMonth() + 1);

      const entrenamientosFirebase = await this.firebaseService.obtenerEntrenamientosRango(fechaInicio, fechaFin);

      this.entrenamientos = entrenamientosFirebase.map(e => ({
        fecha: new Date(e.fecha),
        grupos: e.grupos,
        completado: e.completado,
        ejercicios: e.ejercicios,
        id: e.id
      }));
    } catch (error) {
      console.error('Error al cargar entrenamientos:', error);
      this.entrenamientos = [];
    }
  }

  // ============= CAMBIOS DE VISTA =============
  cambiarVista(vista: TipoVista): void {
    this.vistaActual = vista;
  }

  abrirConfiguracion(): void {
    this.mostrarConfiguracion = true;
  }

  // ============= GENERACIÓN DEL PLAN =============
  async generarPlan(): Promise<void> {
    if (!this.validarConfiguracion()) return;

    this.cargando = true;
    try {
      // Guardar plan en Firebase
      const gruposCodes = this.gruposSeleccionados.map(g => g.code);
      this.planId = await this.firebaseService.guardarPlan({
        gruposSeleccionados: gruposCodes,
        tipoSeleccion: this.tipoSeleccion,
        diasSemanaSeleccionados: this.diasSemanaSeleccionados,
        cantidadDias: this.cantidadDias,
        duracionMeses: this.duracionMeses,
        rutinaPartida: this.rutinaPartida
      });

      // Generar entrenamientos localmente
      const entrenamientosGenerados = this.generarPlanCompleto();

      // Guardar entrenamientos en Firebase
      for (const entrenamiento of entrenamientosGenerados) {
        await this.firebaseService.guardarDiaEntrenamiento({
          fecha: entrenamiento.fecha.toISOString(),
          grupos: entrenamiento.grupos,
          ejercicios: entrenamiento.ejercicios || [],
          completado: entrenamiento.completado
        });
      }

      this.entrenamientos = entrenamientosGenerados;
      this.planConfigurado = true;

      this.mostrarMensajeExito();
      this.mostrarConfiguracion = false;
    } catch (error) {
      console.error('Error al generar plan:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el plan. Verifica tu conexión.'
      });
    } finally {
      this.cargando = false;
    }
  }

  private validarConfiguracion(): boolean {
    if (this.gruposSeleccionados.length === 0) {
      this.mostrarAdvertencia('Debes seleccionar al menos un grupo muscular');
      return false;
    }

    if (this.tipoSeleccion === 'dias-especificos' && this.diasSemanaSeleccionados.length === 0) {
      this.mostrarAdvertencia('Debes seleccionar al menos un día de la semana');
      return false;
    }

    return true;
  }

  private generarPlanCompleto(): DiaEntrenamiento[] {
    const entrenamientos: DiaEntrenamiento[] = [];
    const hoy = new Date();
    const totalDias = this.duracionMeses * DIAS_POR_MES;
    const proximoLunes = this.obtenerProximoLunes(hoy);
    const distribucion = this.crearDistribucionGrupos();

    if (!this.esLunesHoy(hoy, proximoLunes)) {
      this.agregarDiasSemanaActual(entrenamientos, hoy, proximoLunes, distribucion);
    }

    this.generarEntrenamientosFuturos(entrenamientos, proximoLunes, totalDias, distribucion);

    return entrenamientos;
  }

  private generarEntrenamientosFuturos(
    entrenamientos: DiaEntrenamiento[],
    proximoLunes: Date,
    totalDias: number,
    distribucion: string[][]
  ): void {
    for (let i = 0; i < totalDias; i++) {
      const fecha = new Date(proximoLunes);
      fecha.setDate(proximoLunes.getDate() + i);

      if (this.debeEntrenarEnFecha(fecha, i)) {
        const gruposDelDia = this.obtenerGruposParaDiaOptimizado(i, distribucion, fecha.getDay());

        if (gruposDelDia.length > 0) {
          entrenamientos.push({
            fecha,
            grupos: gruposDelDia,
            completado: false
          });
        }
      }
    }
  }

  private debeEntrenarEnFecha(fecha: Date, indiceDia: number): boolean {
    return this.tipoSeleccion === 'dias-especificos'
      ? this.diasSemanaSeleccionados.includes(fecha.getDay())
      : this.debeDiaEntrenarDesdeInicio(indiceDia);
  }

  private esLunesHoy(hoy: Date, proximoLunes: Date): boolean {
    return hoy.getDay() === 1 && hoy >= proximoLunes;
  }

  // ============= NAVEGACIÓN TEMPORAL =============
  semanaAnterior(): void {
    this.cambiarSemana(-7);
  }

  semanaSiguiente(): void {
    this.cambiarSemana(7);
  }

  mesAnterior(): void {
    this.cambiarMes(-1);
  }

  mesSiguiente(): void {
    this.cambiarMes(1);
  }

  private async cambiarSemana(dias: number): Promise<void> {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    this.fechaSeleccionada = nuevaFecha;
    await this.cargarEntrenamientos();
  }

  private async cambiarMes(meses: number): Promise<void> {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
    this.fechaSeleccionada = nuevaFecha;
    await this.cargarEntrenamientos();
  }

  // ============= OBTENCIÓN DE DATOS =============
  obtenerSemanaActual(): Date[] {
    const semana: Date[] = [];
    const hoy = new Date(this.fechaSeleccionada);
    const diaSemana = hoy.getDay();
    const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana;

    const primerDia = new Date(hoy);
    primerDia.setDate(hoy.getDate() + ajuste);

    for (let i = 0; i < DIAS_EN_SEMANA; i++) {
      const dia = new Date(primerDia);
      dia.setDate(primerDia.getDate() + i);
      semana.push(dia);
    }

    return semana;
  }

  obtenerDiasMes(): Date[] {
    const year = this.fechaSeleccionada.getFullYear();
    const month = this.fechaSeleccionada.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const dias: Date[] = [];

    let diaSemanaInicio = primerDia.getDay();
    diaSemanaInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;

    // Días del mes anterior
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      dias.push(new Date(year, month, -i));
    }

    // Días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(year, month, i));
    }

    // Días del siguiente mes
    const diasRestantes = 7 - (dias.length % 7);
    if (diasRestantes < 7) {
      for (let i = 1; i <= diasRestantes; i++) {
        dias.push(new Date(year, month + 1, i));
      }
    }

    return dias;
  }

  obtenerEntrenamientoDia(fecha: Date): DiaEntrenamiento | null {
    return this.entrenamientos.find(e =>
      this.sonMismoDia(e.fecha, fecha)
    ) || null;
  }

  obtenerNombreGrupo(code: string): string {
    return this.gruposMusculares.find(g => g.code === code)?.nombre || code;
  }

  obtenerNombreCortoGrupo(code: string): string {
    return this.gruposMusculares.find(g => g.code === code)?.nombreCorto || code.substring(0, 2);
  }

  obtenerInicialesGrupo(code: string): string {
    return this.obtenerNombreCortoGrupo(code);
  }

  obtenerColorGrupo(code: string): string {
    return this.gruposMusculares.find(g => g.code === code)?.color || '#6366f1';
  }

  obtenerNombreMes(): string {
    return this.fechaSeleccionada.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  }

  // ============= VALIDACIONES DE FECHA =============
  esHoy(fecha: Date): boolean {
    return this.sonMismoDia(fecha, new Date());
  }

  esDiaFuturo(fecha: Date): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha > hoy;
  }

  esMesActual(fecha: Date): boolean {
    return fecha.getMonth() === this.fechaSeleccionada.getMonth();
  }

  private sonMismoDia(fecha1: Date, fecha2: Date): boolean {
    return fecha1.toDateString() === fecha2.toDateString();
  }

  // ============= ACCIONES DE ENTRENAMIENTO =============
  async verDetalleEntrenamiento(fecha: Date): Promise<void> {
    let entrenamiento = this.obtenerEntrenamientoDia(fecha);

    if (!entrenamiento) {
      this.mostrarInfo('Día de descanso', 'No tienes entrenamiento programado para este día');
      return;
    }

    // Cargar ejercicios desde Firebase si no están cargados
    if (!entrenamiento.ejercicios || entrenamiento.ejercicios.length === 0) {
      try {
        const entrenamientoFirebase = await this.firebaseService.obtenerDiaEntrenamiento(fecha);
        if (entrenamientoFirebase) {
          entrenamiento.ejercicios = entrenamientoFirebase.ejercicios || [];
          entrenamiento.id = entrenamientoFirebase.id;
        }
      } catch (error) {
        console.error('Error al cargar ejercicios:', error);
        // Si es un error de Firebase y no hay ejercicios, usar ejercicios dummy
        if (!entrenamiento.ejercicios || entrenamiento.ejercicios.length === 0) {
          entrenamiento.ejercicios = this.obtenerEjerciciosDummy(entrenamiento.grupos);
        }
      }
    }

    this.diaSeleccionado = entrenamiento;
    this.fechaDiaSeleccionado = fecha;
    this.ejerciciosDelDia = entrenamiento.ejercicios || [];
    this.ejercicioActualIndex = 0;
    this.ejercicioActual = this.ejerciciosDelDia.length > 0 ? this.ejerciciosDelDia[0] : null;
    this.mostrarEjerciciosDrawer = true;
  }

  async marcarCompletado(entrenamiento: DiaEntrenamiento, event?: Event): Promise<void> {
    event?.stopPropagation();

    entrenamiento.completado = !entrenamiento.completado;

    // Actualizar en Firebase
    if (entrenamiento.id) {
      try {
        await this.firebaseService.actualizarDiaEntrenamiento(entrenamiento.id, {
          completado: entrenamiento.completado
        });
      } catch (error) {
        console.error('Error al actualizar:', error);
      }
    }

    const mensaje = entrenamiento.completado
      ? '¡Buen trabajo! Entrenamiento completado'
      : 'Entrenamiento marcado como pendiente';

    this.mostrarInfo(
      entrenamiento.completado ? 'Completado' : 'Pendiente',
      mensaje
    );
  }

  cerrarDetalle(): void {
    this.mostrarDetalleDialog = false;
    this.mostrarEjerciciosDrawer = false;
    this.diaSeleccionado = null;
    this.fechaDiaSeleccionado = null;
    this.ejerciciosDelDia = [];
    this.ejercicioEditando = null;
    this.mostrarFormEjercicio = false;
    this.ejercicioActual = null;
    this.ejercicioActualIndex = 0;
  }

  // ============= NAVEGACIÓN DEL CAROUSEL =============
  ejercicioAnterior(): void {
    if (this.ejercicioActualIndex > 0) {
      this.ejercicioActualIndex--;
      this.actualizarEjercicioActual();
    }
  }

  ejercicioSiguiente(): void {
    if (this.ejercicioActualIndex < this.ejerciciosDelDia.length - 1) {
      this.ejercicioActualIndex++;
      this.actualizarEjercicioActual();
    }
  }

  irAEjercicio(index: number): void {
    if (index >= 0 && index < this.ejerciciosDelDia.length) {
      this.ejercicioActualIndex = index;
      this.actualizarEjercicioActual();
    }
  }

  private actualizarEjercicioActual(): void {
    this.ejercicioActual = this.ejerciciosDelDia[this.ejercicioActualIndex] || null;
  }

  private touchStartX = 0;
  private touchEndX = 0;

  touchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  touchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const deltaX = this.touchStartX - this.touchEndX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe izquierda - siguiente ejercicio
        this.ejercicioSiguiente();
      } else {
        // Swipe derecha - ejercicio anterior
        this.ejercicioAnterior();
      }
    }
  }

  onTiempoCompletado(): void {
    // Cuando se completa el descanso, avanzar al siguiente ejercicio
    if (this.ejercicioActualIndex < this.ejerciciosDelDia.length - 1) {
      this.ejercicioSiguiente();
    }
  }

  obtenerImagenEjercicio(ejercicio: EjercicioEntrenamiento): string {
    // Mapeo de ejercicios a imágenes (usando placeholders por ahora)
    const imagenesEjercicios: { [key: string]: string } = {
      'Press de banca': 'assets/images/ejercicios/press-banca.jpg',
      'Press inclinado con mancuernas': 'assets/images/ejercicios/press-inclinado.jpg',
      'Aperturas': 'assets/images/ejercicios/aperturas.jpg',
      'Dominadas': 'assets/images/ejercicios/dominadas.jpg',
      'Remo con barra': 'assets/images/ejercicios/remo-barra.jpg',
      'Jalones al pecho': 'assets/images/ejercicios/jalones.jpg',
      'Sentadillas': 'assets/images/ejercicios/sentadillas.jpg',
      'Prensa de piernas': 'assets/images/ejercicios/prensa.jpg',
      'Extensiones de cuádriceps': 'assets/images/ejercicios/extensiones.jpg',
      'Press militar': 'assets/images/ejercicios/press-militar.jpg',
      'Elevaciones laterales': 'assets/images/ejercicios/elevaciones-laterales.jpg',
      'Elevaciones frontales': 'assets/images/ejercicios/elevaciones-frontales.jpg',
      'Curl de bíceps': 'assets/images/ejercicios/curl-biceps.jpg',
      'Extensiones de tríceps': 'assets/images/ejercicios/extensiones-triceps.jpg',
      'Curl martillo': 'assets/images/ejercicios/curl-martillo.jpg',
      'Plancha': 'assets/images/ejercicios/plancha.jpg',
      'Abdominales': 'assets/images/ejercicios/abdominales.jpg',
      'Mountain climbers': 'assets/images/ejercicios/mountain-climbers.jpg'
    };

    return imagenesEjercicios[ejercicio.nombre] || 'assets/images/kettlebell.png';
  }

  onErrorImagen(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/kettlebell.png';
    }
  }

  // ============= GESTIÓN DE EJERCICIOS =============
  abrirFormEjercicio(ejercicio?: EjercicioEntrenamiento): void {
    if (ejercicio) {
      this.ejercicioEditando = { ...ejercicio };
    } else {
      this.ejercicioEditando = {
        nombre: '',
        series: 3,
        repeticiones: '10',
        peso: 0,
        descanso: 60,
        notas: '',
        completado: false
      };
    }
    this.mostrarFormEjercicio = true;
  }

  cerrarFormEjercicio(): void {
    this.ejercicioEditando = null;
    this.mostrarFormEjercicio = false;
  }

  async guardarEjercicio(): Promise<void> {
    if (!this.diaSeleccionado || !this.ejercicioEditando || !this.ejercicioEditando.nombre) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Completa el nombre del ejercicio'
      });
      return;
    }

    try {
      if (!this.diaSeleccionado.id) {
        // Crear el día en Firebase si no existe
        const fechaStr = this.fechaDiaSeleccionado?.toISOString() || new Date().toISOString();
        const id = await this.firebaseService.guardarDiaEntrenamiento({
          fecha: fechaStr,
          grupos: this.diaSeleccionado.grupos,
          ejercicios: [],
          completado: false
        });
        this.diaSeleccionado.id = id;
      }

      if (this.ejercicioEditando.id) {
        // Actualizar ejercicio existente
        await this.firebaseService.actualizarEjercicio(
          this.diaSeleccionado.id,
          this.ejercicioEditando.id,
          this.ejercicioEditando
        );
        const index = this.ejerciciosDelDia.findIndex(e => e.id === this.ejercicioEditando!.id);
        if (index !== -1) {
          this.ejerciciosDelDia[index] = { ...this.ejercicioEditando };
        }
      } else {
        // Agregar nuevo ejercicio
        const ejercicioId = await this.firebaseService.agregarEjercicioADia(
          this.diaSeleccionado.id,
          this.ejercicioEditando
        );
        this.ejerciciosDelDia.push({ ...this.ejercicioEditando, id: ejercicioId });
      }

      if (this.diaSeleccionado) {
        this.diaSeleccionado.ejercicios = [...this.ejerciciosDelDia];
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Ejercicio guardado correctamente'
      });

      this.cerrarFormEjercicio();
    } catch (error) {
      console.error('Error al guardar ejercicio:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el ejercicio'
      });
    }
  }

  async eliminarEjercicio(ejercicio: EjercicioEntrenamiento): Promise<void> {
    if (!this.diaSeleccionado?.id || !ejercicio.id) return;

    try {
      await this.firebaseService.eliminarEjercicio(this.diaSeleccionado.id, ejercicio.id);
      this.ejerciciosDelDia = this.ejerciciosDelDia.filter(e => e.id !== ejercicio.id);

      if (this.diaSeleccionado) {
        this.diaSeleccionado.ejercicios = [...this.ejerciciosDelDia];
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Ejercicio eliminado'
      });
    } catch (error) {
      console.error('Error al eliminar ejercicio:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el ejercicio'
      });
    }
  }

  async toggleEjercicioCompletado(ejercicio: EjercicioEntrenamiento): Promise<void> {
    if (!this.diaSeleccionado?.id || !ejercicio.id) return;

    ejercicio.completado = !ejercicio.completado;

    try {
      await this.firebaseService.actualizarEjercicio(
        this.diaSeleccionado.id,
        ejercicio.id,
        { completado: ejercicio.completado }
      );
    } catch (error) {
      console.error('Error al actualizar ejercicio:', error);
      ejercicio.completado = !ejercicio.completado; // Revertir
    }
  }

  // ============= MANEJO DE DÍAS SELECCIONADOS =============
  onDiaChange(valor: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.agregarDiaSeleccionado(valor);
    } else {
      this.removerDiaSeleccionado(valor);
    }
  }

  private agregarDiaSeleccionado(valor: number): void {
    if (!this.diasSemanaSeleccionados.includes(valor)) {
      this.diasSemanaSeleccionados.push(valor);
    }
  }

  private removerDiaSeleccionado(valor: number): void {
    const index = this.diasSemanaSeleccionados.indexOf(valor);
    if (index > -1) {
      this.diasSemanaSeleccionados.splice(index, 1);
    }
  }

  // ============= ALGORITMOS DE DISTRIBUCIÓN =============
  private obtenerProximoLunes(fecha: Date): Date {
    const dia = fecha.getDay();
    const proximoLunes = new Date(fecha);

    const diasHastaLunes = dia === 0 ? 1 : (dia === 1 ? 7 : 8 - dia);
    proximoLunes.setDate(fecha.getDate() + diasHastaLunes);

    return proximoLunes;
  }

  private agregarDiasSemanaActual(
    entrenamientos: DiaEntrenamiento[],
    hoy: Date,
    proximoLunes: Date,
    distribucion: string[][]
  ): void {
    const diaActual = hoy.getDay();
    const diasRestantes = diaActual === 0 ? 1 : 8 - diaActual;

    if (this.tipoSeleccion === 'dias-especificos') {
      this.agregarDiasEspecificos(entrenamientos, hoy, diasRestantes, distribucion);
    } else {
      this.agregarDiasProporcionales(entrenamientos, hoy, diasRestantes, distribucion);
    }
  }

  private agregarDiasEspecificos(
    entrenamientos: DiaEntrenamiento[],
    hoy: Date,
    diasRestantes: number,
    distribucion: string[][]
  ): void {
    for (let i = 0; i < diasRestantes; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = fecha.getDay();

      if (this.diasSemanaSeleccionados.includes(diaSemana)) {
        const grupos = this.obtenerGruposParaDiaOptimizado(0, distribucion, diaSemana);
        if (grupos.length > 0) {
          entrenamientos.push({
            fecha,
            grupos,
            completado: false
          });
        }
      }
    }
  }

  private agregarDiasProporcionales(
    entrenamientos: DiaEntrenamiento[],
    hoy: Date,
    diasRestantes: number,
    distribucion: string[][]
  ): void {
    const diasEntrenarEstaSemana = Math.ceil((diasRestantes / 7) * this.cantidadDias);
    let diasAgregados = 0;

    for (let i = 0; i < diasRestantes && diasAgregados < diasEntrenarEstaSemana; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = fecha.getDay();

      const grupos = this.obtenerGruposParaDiaOptimizado(diasAgregados, distribucion, diaSemana);

      if (grupos.length > 0) {
        entrenamientos.push({
          fecha,
          grupos,
          completado: false
        });
        diasAgregados++;
      }
    }
  }

  private debeDiaEntrenarDesdeInicio(indiceDia: number): boolean {
    const diaEnSemana = indiceDia % 7;
    const intervalo = Math.floor(7 / this.cantidadDias);

    for (let i = 0; i < this.cantidadDias; i++) {
      if (diaEnSemana === i * intervalo) {
        return true;
      }
    }

    return false;
  }

  private obtenerGruposParaDiaOptimizado(
    indiceDia: number,
    distribucion: string[][],
    diaSemana: number
  ): string[] {
    const indiceDistribucion = indiceDia % distribucion.length;
    let grupos = [...(distribucion[indiceDistribucion] || [])];

    // Optimizar para cardio en fines de semana
    if (this.esFinDeSemana(diaSemana) && grupos.length > 0) {
      grupos = this.priorizarCardioEnFinDeSemana(grupos, distribucion);
    }

    return grupos;
  }

  private esFinDeSemana(diaSemana: number): boolean {
    return diaSemana === 6 || diaSemana === 0;
  }

  private priorizarCardioEnFinDeSemana(grupos: string[], distribucion: string[][]): string[] {
    if (grupos.includes('CARDIO')) return grupos;

    for (let i = 0; i < distribucion.length; i++) {
      const indexCardio = distribucion[i].indexOf('CARDIO');
      if (indexCardio !== -1) {
        const grupoAIntercambiar = grupos[0];
        distribucion[i][indexCardio] = grupoAIntercambiar;
        grupos[0] = 'CARDIO';
        break;
      }
    }

    return grupos;
  }

  private crearDistribucionGrupos(): string[][] {
    const grupos = this.gruposSeleccionados.map(g => g.code);
    const numDiasEntrenamiento = this.calcularNumDiasEntrenamiento();
    const distribucion: string[][] = [];
    const gruposPorDia = Math.ceil(grupos.length / numDiasEntrenamiento);

    for (let i = 0; i < numDiasEntrenamiento; i++) {
      const inicio = i * gruposPorDia;
      const fin = Math.min((i + 1) * gruposPorDia, grupos.length);
      distribucion.push(grupos.slice(inicio, fin));
    }

    return distribucion;
  }

  private calcularNumDiasEntrenamiento(): number {
    const multiplicador = this.rutinaPartida ? 2 : 1;
    return this.tipoSeleccion === 'dias-especificos'
      ? this.diasSemanaSeleccionados.length * multiplicador
      : this.cantidadDias * multiplicador;
  }

  // ============= MENSAJES =============
  private mostrarAdvertencia(detalle: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atención',
      detail: detalle
    });
  }

  private mostrarInfo(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail
    });
  }

  private mostrarMensajeExito(): void {
    const diasTexto = this.tipoSeleccion === 'dias-especificos'
      ? `días específicos (${this.diasSemanaSeleccionados.length})`
      : `${this.cantidadDias} días por semana`;

    const rutinaTexto = this.rutinaPartida ? '(rutina partida en 2 semanas)' : '';

    this.messageService.add({
      severity: 'success',
      summary: 'Plan generado',
      detail: `Plan de ${this.duracionMeses} ${this.duracionMeses === 1 ? 'mes' : 'meses'} con ${diasTexto} ${rutinaTexto}`
    });
  }
}
