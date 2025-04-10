import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrenamientosComponent } from './entrenamientos.component';

describe('EntrenamientosComponent', () => {
  let component: EntrenamientosComponent;
  let fixture: ComponentFixture<EntrenamientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrenamientosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntrenamientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
