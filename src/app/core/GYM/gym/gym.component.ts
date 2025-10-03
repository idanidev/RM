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

interface GrupoMuscular {
  nombre: string;
  code: string;
}

interface DiaEntrenamiento {
  fecha: Date;
  grupos: string[];
  completado: boolean;
}

interface ConfiguracionPlan {
  gruposSeleccionados: GrupoMuscular[];
  tipoSeleccion: 'dias-especificos' | 'cantidad-dias';
  diasEspecificos?: number[]; // 0=Dom, 1=Lun, etc
  cantidadDias?: number;
  duracionMeses: number;
  rutinaPartida: boolean; // true = 2 semanas, false = 1 semana
}

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
  // Vista actual
  vistaActual: 'semanal' | 'mensual' = 'semanal';

  // Fecha seleccionada
  fechaSeleccionada: Date = new Date();

  // Sidebar de configuración
  mostrarConfiguracion: boolean = false;

  // Dialog para ver detalle del día
  mostrarDetalleDialog: boolean = false;
  diaSeleccionado: DiaEntrenamiento | null = null;
  fechaDiaSeleccionado: Date | null = null;

  // Grupos musculares disponibles
  gruposMusculares: GrupoMuscular[] = [
    { nombre: 'Pecho', code: 'PECHO' },
    { nombre: 'Espalda', code: 'ESPALDA' },
    { nombre: 'Piernas', code: 'PIERNAS' },
    { nombre: 'Hombros', code: 'HOMBROS' },
    { nombre: 'Brazos', code: 'BRAZOS' },
    { nombre: 'Core', code: 'CORE' },
    { nombre: 'Cardio', code: 'CARDIO' }
  ];

  // Colores para cada grupo muscular
  coloresGrupos: { [key: string]: string } = {
    'PECHO': '#ef4444',      // rojo
    'ESPALDA': '#3b82f6',    // azul
    'PIERNAS': '#8b5cf6',    // morado
    'HOMBROS': '#f59e0b',    // naranja
    'BRAZOS': '#10b981',     // verde
    'CORE': '#ec4899',       // rosa
    'CARDIO': '#06b6d4'      // cyan
  };

  // Configuración del usuario
  gruposSeleccionados: GrupoMuscular[] = [];
  tipoSeleccion: 'dias-especificos' | 'cantidad-dias' = 'cantidad-dias';
  diasSemanaSeleccionados: number[] = [];
  cantidadDias: number = 4;
  duracionMeses: number = 1;
  rutinaPartida: boolean = false;
  opcionesDias: number[] = [2, 3, 4, 5, 6, 7];
  opcionesMeses: number[] = [1, 2, 3, 4, 5, 6];
  diasSemanaOpciones = [
    { nombre: 'Lunes', valor: 1 },
    { nombre: 'Martes', valor: 2 },
    { nombre: 'Miércoles', valor: 3 },
    { nombre: 'Jueves', valor: 4 },
    { nombre: 'Viernes', valor: 5 },
    { nombre: 'Sábado', valor: 6 },
    { nombre: 'Domingo', valor: 0 }
  ];
  planConfigurado: boolean = false;

  // Entrenamientos programados
  entrenamientos: DiaEntrenamiento[] = [];

  // Días de la semana (empezando en Lunes)
  diasSemana: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.cargarConfiguracion();
    if (this.planConfigurado) {
      this.cargarEntrenamientos();
    }
  }

  cargarConfiguracion(): void {
    // Aquí cargarías la configuración del backend
    // Por ahora simulamos que no hay configuración
    this.planConfigurado = false;
  }

  cargarEntrenamientos(): void {
    // Simulación de datos - aquí iría la llamada al backend
    this.entrenamientos = [];
  }

  cambiarVista(vista: 'semanal' | 'mensual'): void {
    this.vistaActual = vista;
  }

  abrirConfiguracion(): void {
    this.mostrarConfiguracion = true;
  }

  generarPlan(): void {
    console.log('Generando plan...', {
      grupos: this.gruposSeleccionados,
      tipo: this.tipoSeleccion,
      dias: this.tipoSeleccion === 'dias-especificos' ? this.diasSemanaSeleccionados : this.cantidadDias,
      meses: this.duracionMeses,
      rutinaPartida: this.rutinaPartida
    });

    if (this.gruposSeleccionados.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debes seleccionar al menos un grupo muscular'
      });
      return;
    }

    if (this.tipoSeleccion === 'dias-especificos' && this.diasSemanaSeleccionados.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debes seleccionar al menos un día de la semana'
      });
      return;
    }

    // Generar plan para los meses especificados
    this.entrenamientos = this.generarPlanCompleto();
    this.planConfigurado = true;

    console.log('Plan generado:', this.entrenamientos);

    const diasTexto = this.tipoSeleccion === 'dias-especificos'
      ? `días específicos (${this.diasSemanaSeleccionados.length})`
      : `${this.cantidadDias} días por semana`;

    this.messageService.add({
      severity: 'success',
      summary: 'Plan generado',
      detail: `Plan de ${this.duracionMeses} ${this.duracionMeses === 1 ? 'mes' : 'meses'} con ${diasTexto} ${this.rutinaPartida ? '(rutina partida en 2 semanas)' : ''}`
    });

    this.mostrarConfiguracion = false;
    // Aquí guardarías el plan en el backend
  }

  generarPlanCompleto(): DiaEntrenamiento[] {
    const entrenamientos: DiaEntrenamiento[] = [];
    const hoy = new Date();
    const totalDias = this.duracionMeses * 30;

    // Obtener el próximo lunes
    const proximoLunes = this.obtenerProximoLunes(hoy);

    // Crear distribución de grupos (con cardio priorizado para fines de semana)
    const distribucion = this.crearDistribucionGrupos();

    // Si hoy no es lunes, calcular días de esta semana
    if (hoy.getDay() !== 1 || hoy < proximoLunes) {
      this.agregarDiasSemanaActual(entrenamientos, hoy, proximoLunes, distribucion);
    }

    // Generar entrenamientos desde el próximo lunes
    for (let i = 0; i < totalDias; i++) {
      const fecha = new Date(proximoLunes);
      fecha.setDate(proximoLunes.getDate() + i);

      const diaSemana = fecha.getDay();

      const debeEntrenar = this.tipoSeleccion === 'dias-especificos'
        ? this.diasSemanaSeleccionados.includes(diaSemana)
        : this.debeDiaEntrenarDesdeInicio(i);

      if (debeEntrenar) {
        const gruposDelDia = this.obtenerGruposParaDiaOptimizado(i, distribucion, diaSemana);

        if (gruposDelDia.length > 0) {
          entrenamientos.push({
            fecha: fecha,
            grupos: gruposDelDia,
            completado: false
          });
        }
      }
    }

    return entrenamientos;
  }

  obtenerProximoLunes(fecha: Date): Date {
    const dia = fecha.getDay();
    const proximoLunes = new Date(fecha);

    if (dia === 0) { // Domingo
      proximoLunes.setDate(fecha.getDate() + 1);
    } else if (dia === 1) { // Lunes
      proximoLunes.setDate(fecha.getDate() + 7);
    } else { // Martes a Sábado
      const diasHastaLunes = 8 - dia;
      proximoLunes.setDate(fecha.getDate() + diasHastaLunes);
    }

    return proximoLunes;
  }

  agregarDiasSemanaActual(
    entrenamientos: DiaEntrenamiento[],
    hoy: Date,
    proximoLunes: Date,
    distribucion: string[][]
  ): void {
    const diaActual = hoy.getDay();
    const diasRestantes = diaActual === 0 ? 1 : 8 - diaActual; // Días hasta el domingo

    if (this.tipoSeleccion === 'dias-especificos') {
      // Usar días específicos seleccionados
      for (let i = 0; i < diasRestantes; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        const diaSemana = fecha.getDay();

        if (this.diasSemanaSeleccionados.includes(diaSemana)) {
          const grupos = this.obtenerGruposParaDiaOptimizado(0, distribucion, diaSemana);
          if (grupos.length > 0) {
            entrenamientos.push({
              fecha: fecha,
              grupos: grupos,
              completado: false
            });
          }
        }
      }
    } else {
      // Calcular cuántos días entrenar esta semana (proporcional)
      const diasPorSemanaCompleta = this.cantidadDias;
      const diasEntrenarEstaSemana = Math.ceil((diasRestantes / 7) * diasPorSemanaCompleta);

      let diasAgregados = 0;
      for (let i = 0; i < diasRestantes && diasAgregados < diasEntrenarEstaSemana; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        const diaSemana = fecha.getDay();

        // Priorizar sábado/domingo para cardio si está disponible
        const grupos = this.obtenerGruposParaDiaOptimizado(diasAgregados, distribucion, diaSemana);

        if (grupos.length > 0) {
          entrenamientos.push({
            fecha: fecha,
            grupos: grupos,
            completado: false
          });
          diasAgregados++;
        }
      }
    }
  }

  debeDiaEntrenarDesdeInicio(indiceDia: number): boolean {
    const diaEnSemana = indiceDia % 7;
    const intervalo = Math.floor(7 / this.cantidadDias);
    const maxDias = this.cantidadDias;

    // Distribuir uniformemente en la semana
    for (let i = 0; i < maxDias; i++) {
      if (diaEnSemana === i * intervalo) {
        return true;
      }
    }

    return false;
  }

  obtenerGruposParaDiaOptimizado(
    indiceDia: number,
    distribucion: string[][],
    diaSemana: number
  ): string[] {
    const indiceDistribucion = indiceDia % distribucion.length;
    let grupos = distribucion[indiceDistribucion] || [];

    // Si es fin de semana (sábado=6 o domingo=0) y hay cardio, priorizarlo
    if ((diaSemana === 6 || diaSemana === 0) && grupos.length > 0) {
      const tieneCardio = grupos.includes('CARDIO');

      if (!tieneCardio) {
        // Buscar si cardio está en otra distribución y cambiarlo
        for (let i = 0; i < distribucion.length; i++) {
          if (distribucion[i].includes('CARDIO')) {
            // Intercambiar cardio con un grupo del fin de semana
            const grupoAIntercambiar = grupos[0];
            const indexCardio = distribucion[i].indexOf('CARDIO');
            const indexGrupo = grupos.indexOf(grupoAIntercambiar);

            distribucion[i][indexCardio] = grupoAIntercambiar;
            grupos[indexGrupo] = 'CARDIO';
            break;
          }
        }
      }
    }

    return grupos;
  }

  crearDistribucionGrupos(): string[][] {
    const grupos = this.gruposSeleccionados.map(g => g.code);
    const diasPorCiclo = this.rutinaPartida ? 14 : 7; // 2 semanas o 1 semana

    const numDiasEntrenamiento = this.tipoSeleccion === 'dias-especificos'
      ? this.diasSemanaSeleccionados.length * (this.rutinaPartida ? 2 : 1)
      : this.cantidadDias * (this.rutinaPartida ? 2 : 1);

    const distribucion: string[][] = [];
    const gruposPorDia = Math.ceil(grupos.length / numDiasEntrenamiento);

    // Distribuir grupos equitativamente
    for (let i = 0; i < numDiasEntrenamiento; i++) {
      const inicio = i * gruposPorDia;
      const fin = Math.min((i + 1) * gruposPorDia, grupos.length);
      distribucion.push(grupos.slice(inicio, fin));
    }

    return distribucion;
  }

  debeDiaEntrenar(diaSemana: number, indiceDia: number): boolean {
    // Para cantidad de días, distribuir uniformemente en la semana
    const semana = Math.floor(indiceDia / 7);
    const diaEnSemana = indiceDia % 7;

    // Ajustar para empezar en lunes (0=Dom, 1=Lun)
    const diaAjustado = diaSemana === 0 ? 6 : diaSemana - 1;

    // Distribuir días de entrenamiento uniformemente
    const intervalo = Math.floor(7 / this.cantidadDias);
    return diaEnSemana % intervalo === 0 && diaEnSemana / intervalo < this.cantidadDias;
  }

  obtenerGruposParaDia(indiceDia: number, distribucion: string[][]): string[] {
    const ciclo = this.rutinaPartida ? 14 : 7;

    // Contar cuántos días de entrenamiento han pasado
    let diasEntrenamiento = 0;
    for (let i = 0; i < indiceDia; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + i);
      const diaSemana = fecha.getDay();

      const entrena = this.tipoSeleccion === 'dias-especificos'
        ? this.diasSemanaSeleccionados.includes(diaSemana)
        : this.debeDiaEntrenar(diaSemana, i);

      if (entrena) diasEntrenamiento++;
    }

    const indiceDistribucion = diasEntrenamiento % distribucion.length;
    return distribucion[indiceDistribucion] || [];
  }

  verDetalleEntrenamiento(fecha: Date): void {
    const entrenamiento = this.obtenerEntrenamientoDia(fecha);

    if (!entrenamiento) {
      this.messageService.add({
        severity: 'info',
        summary: 'Día de descanso',
        detail: 'No tienes entrenamiento programado para este día'
      });
      return;
    }

    this.diaSeleccionado = entrenamiento;
    this.fechaDiaSeleccionado = fecha;
    this.mostrarDetalleDialog = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalleDialog = false;
    this.diaSeleccionado = null;
    this.fechaDiaSeleccionado = null;
  }

  obtenerSemanaActual(): Date[] {
    const semana: Date[] = [];
    const hoy = new Date(this.fechaSeleccionada);
    const diaSemana = hoy.getDay();
    const primerDia = new Date(hoy);
    // Ajustar para que Lunes sea el primer día (0=Dom, 1=Lun)
    const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana;
    primerDia.setDate(hoy.getDate() + ajuste);

    for (let i = 0; i < 7; i++) {
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

    // Obtener el día de la semana del primer día (0=Dom, 1=Lun, ..., 6=Sáb)
    let diaSemanaInicio = primerDia.getDay();
    // Convertir para que Lunes sea 0 (Dom=6, Lun=0, Mar=1...)
    diaSemanaInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;

    // Añadir días del mes anterior para completar la primera semana
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const dia = new Date(year, month, -i);
      dias.push(dia);
    }

    // Añadir todos los días del mes
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(year, month, i));
    }

    // Añadir días del siguiente mes para completar la última semana
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
      e.fecha.toDateString() === fecha.toDateString()
    ) || null;
  }

  marcarCompletado(entrenamiento: DiaEntrenamiento, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    entrenamiento.completado = !entrenamiento.completado;

    this.messageService.add({
      severity: 'info',
      summary: entrenamiento.completado ? 'Completado' : 'Pendiente',
      detail: entrenamiento.completado ?
        '¡Buen trabajo! Entrenamiento completado' :
        'Entrenamiento marcado como pendiente'
    });

    // Aquí actualizarías el estado en el backend
  }

  obtenerNombreGrupo(code: string): string {
    return this.gruposMusculares.find(g => g.code === code)?.nombre || code;
  }

  obtenerInicialesGrupo(code: string): string {
    const nombre = this.obtenerNombreGrupo(code);
    // Obtener las primeras 2 letras
    return nombre.substring(0, 2).toUpperCase();
  }

  obtenerColorGrupo(code: string): string {
    return this.coloresGrupos[code] || '#6366f1';
  }

  onDiaChange(valor: number, event: any): void {
    if (event.target.checked) {
      if (!this.diasSemanaSeleccionados.includes(valor)) {
        this.diasSemanaSeleccionados.push(valor);
      }
    } else {
      const index = this.diasSemanaSeleccionados.indexOf(valor);
      if (index > -1) {
        this.diasSemanaSeleccionados.splice(index, 1);
      }
    }
  }

  esMesActual(fecha: Date): boolean {
    return fecha.getMonth() === this.fechaSeleccionada.getMonth();
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  esDiaFuturo(fecha: Date): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha > hoy;
  }

  semanaAnterior(): void {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() - 7);
    this.fechaSeleccionada = nuevaFecha;
  }

  semanaSiguiente(): void {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    this.fechaSeleccionada = nuevaFecha;
  }

  mesAnterior(): void {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    this.fechaSeleccionada = nuevaFecha;
  }

  mesSiguiente(): void {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    this.fechaSeleccionada = nuevaFecha;
  }

  obtenerNombreMes(): string {
    return this.fechaSeleccionada.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
}
