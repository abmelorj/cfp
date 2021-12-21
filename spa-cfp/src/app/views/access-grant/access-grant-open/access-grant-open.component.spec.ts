import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessGrantOpenComponent } from './access-grant-open.component';

describe('AccessGrantOpenComponent', () => {
  let component: AccessGrantOpenComponent;
  let fixture: ComponentFixture<AccessGrantOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessGrantOpenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessGrantOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
