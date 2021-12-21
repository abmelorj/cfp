import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessGrantCreateComponent } from './access-grant-create.component';

describe('AccessGrantCreateComponent', () => {
  let component: AccessGrantCreateComponent;
  let fixture: ComponentFixture<AccessGrantCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessGrantCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessGrantCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
