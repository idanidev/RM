import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
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

@Component({
  selector: 'app-gym',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
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

  // Configuración del usuario
  gruposSeleccionados: GrupoMuscular[] = [];
  diasPorSemana: number = 4;
  opcionesDias: number[] = [2, 3, 4, 5, 6, 7];
  planConfigurado: boolean = false;

  // Entrenamientos programados
  entrenamientos: DiaEntrenamiento[] = [];

  // Días de la semana
  diasSemana: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  constructor(private messageService: MessageService) {}

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
      dias: this.diasPorSemana
    });

    if (this.gruposSeleccionados.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debes seleccionar al menos un grupo muscular'
      });
      return;
    }

    // Generar plan automáticamente distribuyendo los grupos en los días
    this.entrenamientos = this.distribuirEntrenamientos();
    this.planConfigurado = true;

    console.log('Plan generado:', this.entrenamientos);

    this.messageService.add({
      severity: 'success',
      summary: 'Plan generado',
      detail: `Plan de ${this.diasPorSemana} días creado correctamente`
    });

    this.mostrarConfiguracion = false;
    // Aquí guardarías el plan en el backend
  }

  distribuirEntrenamientos(): DiaEntrenamiento[] {
    const entrenamientos: DiaEntrenamiento[] = [];
    const hoy = new Date();
    const primerDiaSemana = new Date(hoy);
    primerDiaSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes

    // Distribuir grupos en los días seleccionados
    const gruposPorDia = Math.ceil(this.gruposSeleccionados.length / this.diasPorSemana);

    for (let i = 0; i < this.diasPorSemana; i++) {
      const fecha = new Date(primerDiaSemana);
      fecha.setDate(primerDiaSemana.getDate() + i);

      const gruposDelDia = this.gruposSeleccionados
        .slice(i * gruposPorDia, (i + 1) * gruposPorDia)
        .map(g => g.code);

      if (gruposDelDia.length > 0) {
        entrenamientos.push({
          fecha: fecha,
          grupos: gruposDelDia,
          completado: false
        });
      }
    }

    return entrenamientos;
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
    primerDia.setDate(hoy.getDate() - diaSemana);

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

    // Añadir días del mes anterior para completar la primera semana
    const diaSemanaInicio = primerDia.getDay();
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
