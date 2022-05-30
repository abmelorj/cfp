import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShallCreateComponent } from './shall-create.component';

describe('ShallCreateComponent', () => {
  let component: ShallCreateComponent;
  let fixture: ComponentFixture<ShallCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShallCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShallCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
