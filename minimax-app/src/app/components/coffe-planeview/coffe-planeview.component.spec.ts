import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffePlaneviewComponent } from './coffe-planeview.component';

describe('CoffePlaneviewComponent', () => {
  let component: CoffePlaneviewComponent;
  let fixture: ComponentFixture<CoffePlaneviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoffePlaneviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoffePlaneviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
