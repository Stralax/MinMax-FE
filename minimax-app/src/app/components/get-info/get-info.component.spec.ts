import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetInfoComponent } from './get-info.component';
import { CoffeeService } from '../../services/coffee.service';

describe('GetInfoComponent', () => {
  let component: GetInfoComponent;
  let fixture: ComponentFixture<GetInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
