import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Ejercicio } from '../../core/models/Ejercicio';
import { CommonModule } from '@angular/common';
import { EjercicioService } from '../../core/service/rm.service';

@Component({
  selector: 'app-rm-list',
  standalone: true,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule, FormsModule, CommonModule],
  templateUrl: './rm-list.component.html',
  styleUrl: './rm-list.component.scss'
})
export class RmListComponent {
  rmInput: string = '';

  constructor(private appwriteService: EjercicioService) { }
  ejercicios: Ejercicio[] = [
    { name: 'Sentadilla', rm: [150], descripcion: 'Ejercicio de pierna' },
    { name: 'Press de banca', rm: [100], descripcion: 'Ejercicio de pecho' }
  ];

  mostrarDialogo: boolean = false;
  modoDialogo: 'nuevo' | 'editar' | 'visualizar' = 'nuevo';
  ejercicioSeleccionado: Ejercicio | null = null;

  nuevoEjercicio() {
    this.modoDialogo = 'nuevo';
    this.ejercicioSeleccionado = { name: '', rm: [] };
    this.mostrarDialogo = true;
  }

  editarEjercicio(ejercicio: Ejercicio) {
    this.modoDialogo = 'editar';
    this.ejercicioSeleccionado = { ...ejercicio };
    this.mostrarDialogo = true;
  }

  eliminarEjercicio(ejercicio: Ejercicio) {
    this.ejercicioSeleccionado = { ...ejercicio };
    this.mostrarDialogo = true;
  }

  visualizarEjercicio(ejercicio: Ejercicio) {
    this.modoDialogo = 'visualizar';
    this.ejercicioSeleccionado = { ...ejercicio };
    this.mostrarDialogo = true;
  }

  verEjercicio(ejercicio: Ejercicio) {
    this.ejercicioSeleccionado = ejercicio;
    this.mostrarDialogo = true;
  }

  cerrarDialogo() {
    this.mostrarDialogo = false;
    this.ejercicioSeleccionado = null;
  }

  async guardarEjercicio() {
    if (this.ejercicioSeleccionado) {
      const rmArray = this.rmInput
        .split(',')
        .map(valor => parseFloat(valor.trim()))
        .filter(valor => !isNaN(valor));
      if (this.modoDialogo === 'nuevo') {
        const ejercicio: Ejercicio = {
          name: this.ejercicioSeleccionado.name,
          rm: rmArray,
        };
        await this.appwriteService.crearEjercicio(ejercicio);
      }
      else if (this.modoDialogo === 'editar') {
        // await this.appwriteService.actualizarEjercicio(this.ejercicioSeleccionado);
      }
    }
    this.cerrarDialogo();
    this.obtenerEjercicios();
  }

  async obtenerEjercicios() {
    this.ejercicios = await this.appwriteService.obtenerEjercicios();
  }

}

