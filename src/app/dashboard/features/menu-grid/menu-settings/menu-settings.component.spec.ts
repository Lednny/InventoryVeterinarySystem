import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuSettingsComponent } from './menu-settings.component';
import { FormsModule } from '@angular/forms';

describe('MenuSettingsComponent', () => {
  let component: MenuSettingsComponent;
  let fixture: ComponentFixture<MenuSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
