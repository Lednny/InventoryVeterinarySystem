import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardAlmacenComponent } from '../dashboard-almacen1/dashboard-almacen.component';

describe('DashboardAlmacenComponent', () => {
  let component: DashboardAlmacenComponent;
  let fixture: ComponentFixture<DashboardAlmacenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAlmacenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAlmacenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
