import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthResetComponent } from './auth-reset.component';

describe('AuthResetComponent', () => {
  let component: AuthResetComponent;
  let fixture: ComponentFixture<AuthResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthResetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
