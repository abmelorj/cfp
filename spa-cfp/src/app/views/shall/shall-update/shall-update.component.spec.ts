import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShallUpdateComponent } from './shall-update.component';

describe('ShallUpdateComponent', () => {
  let component: ShallUpdateComponent;
  let fixture: ComponentFixture<ShallUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShallUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShallUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
