import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAlmacen2Component } from './dashboard-almacen2.component';

describe('DashboardAlmacen2Component', () => {
  let component: DashboardAlmacen2Component;
  let fixture: ComponentFixture<DashboardAlmacen2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAlmacen2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAlmacen2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
