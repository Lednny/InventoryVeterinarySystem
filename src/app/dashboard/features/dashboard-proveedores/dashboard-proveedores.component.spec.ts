import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProveedoresComponent } from './dashboard-proveedores.component';

describe('DashboardProveedoresComponent', () => {
  let component: DashboardProveedoresComponent;
  let fixture: ComponentFixture<DashboardProveedoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProveedoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProveedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
