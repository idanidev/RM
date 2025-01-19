import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { RmEntry } from '../../core/models/Ejercicio';
import { Ejercicio } from './../../core/models/Ejercicio';
import { EjercicioService } from './../../core/service/rm.service';

@Component({
  selector: 'app-rm-list',
  standalone: true,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule, FormsModule, CommonModule],
  templateUrl: './rm-list.component.html',
  styleUrl: './rm-list.component.scss'
})
export class RmListComponent implements OnInit {
  rmInput: number = 0;

  constructor(private appwriteService: EjercicioService) { }

  ejercicios: Ejercicio[] = [
    { name: 'Sentadilla', rm: [JSON.stringify({ valor: 150, fecha: '1996-11-27' })], ID_User:'678d44540024adf64db1', descripcion: 'Ejercicio de pierna' },
    // { name: 'Press de banca', rm: [100], descripcion: 'Ejercicio de pecho' }
  ];

  mostrarDialogo: boolean = false;
  modoDialogo: 'nuevo' | 'editar' | 'visualizar' = 'nuevo';
  ejercicioSeleccionado: Ejercicio | null = null;
  ejercicioPintado: Ejercicio | null = null;
  ultimoRm: RmEntry | null = null;

  ngOnInit(): void {
    this.obtenerEjercicios();
  }

  nuevoEjercicio() {
    this.modoDialogo = 'nuevo';
    this.ejercicioSeleccionado = { name: '', rm: [], ID_User: '' };
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

  getUltimoRm(ejercicio: any): string {
    if (!ejercicio.rm || ejercicio.rm.length === 0) {
      return 'N/A';
    }
    try {
      const ultimoRm = ejercicio.rm;
      return `${ultimoRm.valor}`;
    } catch (error) {
      console.error('Error parsing RM:', error);
      return 'Error';
    }
  }

  async guardarEjercicio() {
    if (this.ejercicioSeleccionado) {
      try {
        // Obtener el usuario actual
        const user = await this.appwriteService.obtenerUsuarioActual();
        if (!user) {
          console.error('No se pudo obtener el ID del usuario.');
          return;
        }
        const userId = user.$id;

        // Crear una nueva entrada de RM con la fecha actual
        const nuevoRm: RmEntry = {
          valor: this.rmInput,
          fecha: new Date().toISOString(),
        };

        // Guardar el ejercicio en Appwrite
        if (this.modoDialogo === 'nuevo') {
          const ejercicio: Ejercicio = {
            ID_User: userId,
            name: this.ejercicioSeleccionado.name,
            rm: [JSON.stringify(nuevoRm)], // Inicializa con el nuevo RmEntry
          };
          await this.appwriteService.crearEjercicio(ejercicio, userId);
        }
        else if (this.modoDialogo === 'editar' && this.ejercicioSeleccionado.ID_User) {
          const rmActual = this.ejercicioSeleccionado.rm ? this.ejercicioSeleccionado.rm : [];
          const ejercicio: Ejercicio = {
            ID_User: userId,
            name: this.ejercicioSeleccionado.name,
            rm: [...rmActual, JSON.stringify(nuevoRm)], // Agrega el nuevo RmEntry al array existente
          };
          await this.appwriteService.actualizarEjercicio(userId, ejercicio);
        }

        // Cerrar el diálogo y actualizar la lista de ejercicios
        this.cerrarDialogo();
        this.obtenerEjercicios();
      } catch (error) {
        console.error('Error al guardar el ejercicio:', error);
      }
    }
  }


  // async obtenerEjercicios() {
  //   try {
  //     const user = await this.appwriteService.obtenerUsuarioActual();
  //     if (!user) {
  //       throw new Error('User is not logged in');
  //     }
  //     const userId = user.$id;

  //     const documentos = await this.appwriteService.obtenerEjerciciosPorUsuario(userId);
  //     this.ejercicios = documentos.map(doc => ({
  //       name: doc['name'],
  //       rm: doc['rm'],
  //       descripcion: doc['descripcion'],
  //       ID_User: doc['ID_User']
  //     }));
  //     // Actualiza la lista de ejercicios en tu componente
  //   } catch (error) {
  //     console.error('Error al obtener los ejercicios:', error);
  //   }
  // }

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
        rm: ejercicio['rm'] ? JSON.parse(ejercicio['rm']) : [],
      }));
    } catch (error) {
      console.error('Error al obtener los ejercicios:', error);
    }
  }

  // async obtenerEjercicios() {
  //   this.ejercicios = await this.appwriteService.obtenerEjercicios();
  // }

}

