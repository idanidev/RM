import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ejercicio-form',
  imports: [DialogModule, ButtonModule, ReactiveFormsModule, FloatLabelModule, CardModule, CommonModule, FormsModule ],
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
    this.ejercicioForm = this.fb.group({
      name: [this.ejercicio?.name || '', [Validators.required, Validators.minLength(3)]],
      rm: [null, [Validators.required, Validators.min(1)]]
    });
    if (this.ejercicio?.documentId) {
      this.ejercicioForm.get('name')?.disable();
    }
  }

  get name() {
    return this.ejercicioForm?.get('name');
  }

  get rm() {
    return this.ejercicioForm?.get('rm');
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
