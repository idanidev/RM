import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Dialog } from "primeng/dialog";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { TableModule } from "primeng/table";
import { Toast } from "primeng/toast";
import { Entrenamiento } from '../../core/models/Ejercicio';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EntrenamientosService } from '../service/entrenamiento.service';

@Component({
  selector: 'app-entrenamientos',
  templateUrl: './entrenamientos.component.html',
  styleUrl: './entrenamientos.component.scss',
  imports: [InputIcon, TableModule, Button, IconField, Toast,ConfirmDialogModule, ConfirmPopupModule, OverlayPanelModule, Dialog, CommonModule, FormsModule]
})
export class EntrenamientosComponent implements OnInit {
  entrenamientos: Entrenamiento[] = [];
  entrenamientoSeleccionado: Entrenamiento = this.crearNuevo();
  mostrarDialogo = false;
  dialogHeader = '';

  constructor(private message: MessageService, private confirm: ConfirmationService, private entrenamientosService: EntrenamientosService) {
    // this.entrenamientos = [
    //   { nombre: 'Murph', descripcion: '1 milla correr, 100 dominadas, 200 flexiones, 300 sentadillas, 1 milla correr', duracion: '45-60 min' },
    //   { nombre: 'Hyrox', descripcion: '8km + estaciones funcionales como ski erg, trineos, etc.', duracion: '60-90 min' }
    // ];
  }

ngOnInit(): void {
  this.entrenamientosService.getEntrenamientos().subscribe(data => {
    this.entrenamientos = data;
  });
}

guardarEntrenamiento() {
  this.entrenamientosService.crearEntrenamiento(this.entrenamientoSeleccionado).subscribe(nuevo => {
    this.entrenamientos.push(nuevo);
    this.cerrarDialogo();
  });
}


  seleccionarEntrenamiento(entrenamiento: Entrenamiento) {
    this.entrenamientoSeleccionado = { ...entrenamiento };
  }

  nuevoEntrenamiento() {
    this.entrenamientoSeleccionado = this.crearNuevo();
    this.dialogHeader = 'Nuevo entrenamiento';
    this.mostrarDialogo = true;
  }

  editarEntrenamiento(entrenamiento: Entrenamiento) {
    this.entrenamientoSeleccionado = { ...entrenamiento };
    this.dialogHeader = 'Editar entrenamiento';
    this.mostrarDialogo = true;
  }

  // guardarEntrenamiento() {
  //   const existente = this.entrenamientos.find(e => e.id === this.entrenamientoSeleccionado.id);
  //   if (existente) {
  //     Object.assign(existente, this.entrenamientoSeleccionado);
  //     this.message.add({ severity: 'success', summary: 'Actualizado', detail: 'Entrenamiento actualizado' });
  //   } else {
  //     this.entrenamientoSeleccionado.id = crypto.randomUUID();
  //     this.entrenamientos.push({ ...this.entrenamientoSeleccionado });
  //     this.message.add({ severity: 'success', summary: 'Añadido', detail: 'Entrenamiento añadido' });
  //   }
  //   this.mostrarDialogo = false;
  // }

  confirmarEliminar(entrenamiento: Entrenamiento) {
    this.confirm.confirm({
      message: `¿Eliminar '${entrenamiento.nombre}'?`,
      header: 'Confirmar',
      accept: () => this.eliminar(entrenamiento)
    });
  }

  eliminar(entrenamiento: Entrenamiento) {
    this.entrenamientos = this.entrenamientos.filter(e => e.id !== entrenamiento.id);
    this.message.add({ severity: 'info', summary: 'Eliminado', detail: 'Entrenamiento eliminado' });
  }

  cerrarDialogo() {
    this.mostrarDialogo = false;
  }

  crearNuevo(): Entrenamiento {
    return { nombre: '', descripcion: '', duracion: '' };
  }
}
