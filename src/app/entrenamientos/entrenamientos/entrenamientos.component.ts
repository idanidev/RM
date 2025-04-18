import { Component } from '@angular/core';

@Component({
  selector: 'app-entrenamientos',
  templateUrl: './entrenamientos.component.html',
  styleUrl: './entrenamientos.component.scss',
  imports: []
})
export class EntrenamientosComponent {
  misDatos = [
    { nombre: 'Ejercicio 1', rm: 100, fecha: new Date('2025-04-01') },
    { nombre: 'Ejercicio 2', rm: 120, fecha: new Date('2025-04-10') },
    // Puedes agregar más registros según sea necesario
  ];

  misColumnas = [
    { field: 'nombre', header: 'Nombre', type: 'text' },
    { field: 'rm', header: 'RM', type: 'number' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
  ];
}
