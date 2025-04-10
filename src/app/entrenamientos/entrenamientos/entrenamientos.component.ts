import { Component } from '@angular/core';
import { TableComponent } from '../../core/components/table/table.component';
import { HeaderComponent } from '../../core/components/header/header.component';

@Component({
  selector: 'app-entrenamientos',
  templateUrl: './entrenamientos.component.html',
  styleUrl: './entrenamientos.component.scss',
  imports: [TableComponent,HeaderComponent]
})
export class EntrenamientosComponent {
  misDatos = [
    { id: 1, nombre: 'Juan', edad: 30 },
    { id: 2, nombre: 'María', edad: 25 },
    { id: 3, nombre: 'Pedro', edad: 35 }
  ];

  misColumnas = [
    { field: 'id', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'edad', header: 'Edad' }
  ];
}
