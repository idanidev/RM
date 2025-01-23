import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { RmEntry } from '../../core/models/Ejercicio';
import { ErrorNotificationService } from '../../core/service/ErrorNotification.service';
import { EjercicioFormComponent } from '../ejercicio-form/ejercicio-form.component';
import { RmChartComponent } from "../rm-chart/rm-chart/rm-chart.component";
import { Ejercicio } from './../../core/models/Ejercicio';
import { EjercicioService } from './../../core/service/rm.service';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-rm-list',
  standalone: true,
  imports: [TableModule, ButtonModule, ConfirmPopupModule,
    ToastModule, DialogModule, InputTextModule, FormsModule, CommonModule, RmChartComponent, OverlayPanelModule, EjercicioFormComponent, ToolbarModule, MenuModule],
  templateUrl: './rm-list.component.html',
  styleUrl: './rm-list.component.scss'
})
export class RmListComponent implements OnInit {
  acciones: { label: string, icon: string, command: () => void }[];
  rmInput: number = 0;
  selectedRmData: any[] = [];
  displayChart: boolean = false;
  ejercicios: Ejercicio[] = [
    // { name: 'Sentadilla', rm: ["{ 'valor': 150, 'fecha': '1996-11-27' }","{ 'valor': 160, 'fecha': '1996-12-27' }"], ID_User: '678d44540024adf64db1', descripcion: 'Ejercicio de pierna' },
    // { name: 'Press de banca', rm: [100], descripcion: 'Ejercicio de pecho' }
  ];

  dialogHeader = '';
  mostrarDialogo: boolean = false;
  modoDialogo: 'nuevo' | 'editar' | 'visualizar' = 'nuevo';
  ejercicioSeleccionado: Ejercicio | null = null;
  ultimoRm: RmEntry | null = null;

  constructor(
    private appwriteService: EjercicioService,
    private errorNotificationService: ErrorNotificationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.acciones = [
      { label: 'Visualizar', icon: 'pi pi-chart-line', command: () => this.visualizarEjercicio(this.ejercicioSeleccionado) },
      { label: 'Añadir', icon: 'pi pi-plus', command: () => { if (this.ejercicioSeleccionado) this.editarEjercicio(this.ejercicioSeleccionado); } },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => { if (this.ejercicioSeleccionado) this.confirmarEliminacion(this.ejercicioSeleccionado); } }
    ];
  }

  ngOnInit(): void {
    this.obtenerEjercicios();
  }

  nuevoEjercicio() {
    this.ejercicioSeleccionado = null;
    this.dialogHeader = 'Nuevo Ejercicio';
    this.mostrarDialogo = true;
  }

  editarEjercicio(ejercicio: Ejercicio) {
    this.ejercicioSeleccionado = { ...ejercicio };
    this.dialogHeader = 'Añadir nuevo RM';
    this.mostrarDialogo = true;
  }

  eliminarEjercicio(ejercicio: Ejercicio) {
    this.ejercicioSeleccionado = { ...ejercicio };
    this.mostrarDialogo = true;
  }

  visualizarEjercicio(ejercicio: any) {
    this.selectedRmData = ejercicio.rm;
    this.displayChart = true;
  }

  verEjercicio(ejercicio: Ejercicio) {
    this.ejercicioSeleccionado = ejercicio;
    this.mostrarDialogo = true;
  }

  seleccionarEjercicio(ejercicio: any) {
    this.ejercicioSeleccionado = ejercicio;
  }

  cerrarDialogo() {
    this.mostrarDialogo = false;
    this.ejercicioSeleccionado = null;
  }

  getUltimoRm(ejercicio: { rm: string | any[]; }, propiedad: any) {
    if (!Array.isArray(ejercicio.rm) || ejercicio.rm.length === 0) {
      return 'N/A';
    }
    try {
      const ultimoRmStr = ejercicio.rm[ejercicio.rm.length - 1];
      return ultimoRmStr[propiedad] !== undefined ? `${ultimoRmStr[propiedad]}` : 'Propiedad no encontrada';
    } catch (error) {
      console.error('Error al parsear el RM:', error);
      return 'Error';
    }
  }

  async guardarEjercicio(ejercicioData: { name: string; rm: number }) {
    try {

      const user = await this.appwriteService.obtenerUsuarioActual();
      if (!user) {
        console.error('No se pudo obtener el ID del usuario.');
        return;
      }
      const userId = user.$id;

      const nuevoRm: any = {
        valor: ejercicioData.rm,
        fecha: new Date().toISOString(),
      };

      const nuevoRmString = JSON.stringify(nuevoRm);

      if (this.ejercicioSeleccionado) {
        let rmActual: string[] = this.ejercicioSeleccionado.rm || [];
        rmActual.push(nuevoRm);

        // Actualizar el ejercicio con el array de RM actualizado
        const ejercicioActualizado: Partial<Ejercicio> = {
          name: this.ejercicioSeleccionado.name,
          rm: rmActual.map(item => JSON.stringify(item)), // Almacena el array de cadenas JSON
        };
        await this.appwriteService.actualizarEjercicio(this.ejercicioSeleccionado.ID_User, ejercicioActualizado);

      } else {
        // Crear nuevo ejercicio
        const nuevoEjercicio: Ejercicio = {
          ID_User: userId,
          name: ejercicioData.name,
          rm: [nuevoRmString],
        };

        await this.appwriteService.crearEjercicio(nuevoEjercicio, userId);
      }

      this.cerrarDialogo();
      this.obtenerEjercicios();

    } catch (error) {
      this.errorNotificationService.showError('Error', 'Ocurrió un error al procesar la solicitud.');
      console.error('Error al guardar el ejercicio:', error);
    }
  }

  async obtenerEjercicios() {
    try {
      const user = await this.appwriteService.obtenerUsuarioActual();
      if (!user) {
        console.error('Usuario no autenticado');
        return;
      }
      const userId = user.$id;
      const ejercicios = await this.appwriteService.obtenerEjerciciosPorUsuario(userId);
      this.ejercicios = ejercicios.map((ejercicio) => ({
        name: ejercicio['name'],
        ID_User: ejercicio['ID_User'],
        documentId: ejercicio.$id,
        rm: Array.isArray(ejercicio['rm'])
          ? ejercicio['rm'].map((item) => JSON.parse(item))
          : [],
      }));
    } catch (error) {
      this.errorNotificationService.showError('Error', 'Error al obtener los ejercicios.');

      console.error('Error al obtener los ejercicios:', error);
    }
  }

  confirmarEliminacion(ejercicio : any) {
    this.confirmationService.confirm({
      // target: event.target as EventTarget,
      message: '¿Estás seguro de que deseas eliminar este elemento?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: async () => {
        await this.appwriteService.eliminarEjercicio(ejercicio.documentId);
        this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: 'Elemento eliminado' });
        this.obtenerEjercicios(); 
      },
      reject: () => {
        this.messageService.add({ severity: 'warn', summary: 'Cancelado', detail: 'Operación cancelada' });
      }
    });
  }

}

