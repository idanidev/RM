import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-ejercicio-form',
  imports: [DialogModule, ButtonModule, ReactiveFormsModule, FloatLabelModule, CardModule, CommonModule],
  standalone: true,
  templateUrl: './ejercicio-form.component.html',
  styleUrl: './ejercicio-form.component.scss'
})
export class EjercicioFormComponent {
  @Input() ejercicio: any;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  ejercicioForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.ejercicioForm = new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)]
      }),
      rm: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(1)]
      })
    });
  }

  get name() {
    return this.ejercicioForm.get('name');
  }

  get rm() {
    return this.ejercicioForm.get('rm');
  }

  onSubmit() {
    if (this.ejercicioForm.valid) {
      this.save.emit(this.ejercicioForm.value);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}