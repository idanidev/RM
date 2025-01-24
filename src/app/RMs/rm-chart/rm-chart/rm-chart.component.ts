import { Component, Input, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { RmEntry } from '../../../core/models/Ejercicio';

@Component({
  selector: 'app-rm-chart',
  imports: [ChartModule],
  standalone: true,
  templateUrl: './rm-chart.component.html',
  styleUrl: './rm-chart.component.scss'
})
export class RmChartComponent implements OnChanges {

  @Input() rmData: RmEntry[] = [];
  chartData: any;
  chartOptions: any;

  ngOnChanges() {
    this.updateChartData();
  }
  updateChartData() {
    const valoresRM = this.rmData.map(entry => entry.valor);
    const valorMinimo = Math.min(...valoresRM);
    const valorMaximo = Math.max(...valoresRM);
    if (this.rmData && this.rmData.length > 0) {
      const labels = this.rmData.map(entry => new Date(entry.fecha).toLocaleDateString());
      const data = this.rmData.map(entry => entry.valor);
      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Peso (kg)',
            data: data,
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          }
        ]
      };

      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Progreso de RM'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Peso (kg)'
            },
            beginAtZero: false,
            min: valorMinimo - 10,
            max: valorMaximo + 10
          }
        }
      };
    }
  }

}