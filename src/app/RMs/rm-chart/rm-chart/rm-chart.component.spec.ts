import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmChartComponent } from './rm-chart.component';

describe('RmChartComponent', () => {
  let component: RmChartComponent;
  let fixture: ComponentFixture<RmChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RmChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RmChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
