import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { EjercicioEntrenamiento } from '../../../service/firebase.service';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() ejercicio: EjercicioEntrenamiento | null = null;
  @Input() descanso: number = 60; // segundos de descanso
  @Output() tiempoCompletado = new EventEmitter<void>();

  tiempoRestante = signal(0);
  estaCorriendo = signal(false);
  estaPausado = signal(false);
  private intervalo: any = null;
  private ejercicioAnteriorId: string | undefined = undefined;

  ngOnInit(): void {
    if (this.ejercicio?.descanso) {
      this.descanso = this.ejercicio.descanso;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el ejercicio, reiniciar el temporizador
    if (changes['ejercicio'] && this.ejercicio) {
      const nuevoId = this.ejercicio.id;
      if (nuevoId !== this.ejercicioAnteriorId) {
        this.detener();
        if (this.ejercicio.descanso) {
          this.descanso = this.ejercicio.descanso;
        }
        this.tiempoRestante.set(0);
        this.ejercicioAnteriorId = nuevoId;
      }
    }
    
    // Si cambia el tiempo de descanso, actualizar
    if (changes['descanso'] && !this.estaCorriendo()) {
      this.descanso = changes['descanso'].currentValue;
      if (this.tiempoRestante() === 0) {
        this.tiempoRestante.set(this.descanso);
      }
    }
  }

  ngOnDestroy(): void {
    this.detener();
  }

  iniciar(): void {
    if (this.tiempoRestante() === 0) {
      this.tiempoRestante.set(this.descanso);
    }
    this.estaCorriendo.set(true);
    this.estaPausado.set(false);

    this.intervalo = setInterval(() => {
      if (this.tiempoRestante() > 0) {
        this.tiempoRestante.set(this.tiempoRestante() - 1);
      } else {
        this.completar();
      }
    }, 1000);
  }

  pausar(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
    this.estaCorriendo.set(false);
    this.estaPausado.set(true);
  }

  reanudar(): void {
    this.iniciar();
  }

  reiniciar(): void {
    this.detener();
    this.tiempoRestante.set(this.descanso);
  }

  detener(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
    this.estaCorriendo.set(false);
    this.estaPausado.set(false);
  }

  completar(): void {
    this.detener();
    this.tiempoRestante.set(0);
    this.tiempoCompletado.emit();
  }

  formatearTiempo(segundos: number): string {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  get porcentajeCompletado(): number {
    if (this.descanso === 0) return 0;
    return ((this.descanso - this.tiempoRestante()) / this.descanso) * 100;
  }
}

