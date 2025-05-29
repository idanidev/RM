import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-porcentajes',
  templateUrl: './porcentajes.component.html',
  styleUrls: ['./porcentajes.component.scss'],
  standalone: true,
  imports: [TableModule],
})
export class PorcentajesComponent implements OnChanges {
  @Input() ejercicio: any;
  porcentajes: { porcentaje: number; peso: number }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ejercicio'] && this.ejercicio) {
      const rmValor = this.ejercicio?.rm?.length
        ? this.ejercicio.rm[this.ejercicio.rm.length - 1]?.valor
        : null;

      if (rmValor) {
        const porcentajesBase = [100, 95, 90, 80, 70, 60, 50, 40];
        this.porcentajes = porcentajesBase.map(p => ({
          porcentaje: p,
          peso: Math.round((rmValor * p) / 100)
        }));
      } else {
        this.porcentajes = [];
      }
    }
  }
}
