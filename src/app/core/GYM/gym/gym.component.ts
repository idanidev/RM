import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';

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
    ToastModule
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
  diaSeleccionado: DiaEntrenamiento | null = null;
  fechaDiaSeleccionado: Date | null = null;

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

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  // ============= INICIALIZACIÓN =============
  private inicializarComponente(): void {
    this.cargarConfiguracion();
    if (this.planConfigurado) {
      this.cargarEntrenamientos();
    }
  }

  private cargarConfiguracion(): void {
    // TODO: Cargar desde backend
    this.planConfigurado = false;
  }

  private cargarEntrenamientos(): void {
    // TODO: Cargar desde backend
    this.entrenamientos = [];
  }

  // ============= CAMBIOS DE VISTA =============
  cambiarVista(vista: TipoVista): void {
    this.vistaActual = vista;
  }

  abrirConfiguracion(): void {
    this.mostrarConfiguracion = true;
  }

  // ============= GENERACIÓN DEL PLAN =============
  generarPlan(): void {
    if (!this.validarConfiguracion()) return;

    this.entrenamientos = this.generarPlanCompleto();
    this.planConfigurado = true;

    this.mostrarMensajeExito();
    this.mostrarConfiguracion = false;
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

  private cambiarSemana(dias: number): void {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    this.fechaSeleccionada = nuevaFecha;
  }

  private cambiarMes(meses: number): void {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
    this.fechaSeleccionada = nuevaFecha;
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
  verDetalleEntrenamiento(fecha: Date): void {
    const entrenamiento = this.obtenerEntrenamientoDia(fecha);

    if (!entrenamiento) {
      this.mostrarInfo('Día de descanso', 'No tienes entrenamiento programado para este día');
      return;
    }

    this.diaSeleccionado = entrenamiento;
    this.fechaDiaSeleccionado = fecha;
    this.mostrarDetalleDialog = true;
  }

  marcarCompletado(entrenamiento: DiaEntrenamiento, event?: Event): void {
    event?.stopPropagation();

    entrenamiento.completado = !entrenamiento.completado;

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
    this.diaSeleccionado = null;
    this.fechaDiaSeleccionado = null;
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
