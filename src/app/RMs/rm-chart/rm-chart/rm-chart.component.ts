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
    if (this.rmData && this.rmData.length > 0) {
      const labels = this.rmData.map(entry => new Date(entry.fecha).toLocaleDateString());
      const data = this.rmData.map(entry => entry.valor);
      console.log('rmData:', this.rmData);
      
      console.log('Labels:', labels);
      console.log('Data:', data);
      
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
            beginAtZero: true
          }
        }
      };
    }
  }

}