import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationCreateComponent } from './operation-create.component';

describe('OperationCreateComponent', () => {
  let component: OperationCreateComponent;
  let fixture: ComponentFixture<OperationCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperationCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
