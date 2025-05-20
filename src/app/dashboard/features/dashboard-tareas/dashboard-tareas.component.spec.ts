import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTareasComponent } from './dashboard-tareas.component';

describe('DashboardTareasComponent', () => {
  let component: DashboardTareasComponent;
  let fixture: ComponentFixture<DashboardTareasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTareasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTareasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
