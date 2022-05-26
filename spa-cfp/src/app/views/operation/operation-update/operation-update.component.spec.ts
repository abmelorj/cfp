import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationUpdateComponent } from './operation-update.component';

describe('OperationUpdateComponent', () => {
  let component: OperationUpdateComponent;
  let fixture: ComponentFixture<OperationUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperationUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
