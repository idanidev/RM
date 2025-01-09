import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmListComponent } from './rm-list.component';

describe('RmListComponent', () => {
  let component: RmListComponent;
  let fixture: ComponentFixture<RmListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RmListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RmListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
