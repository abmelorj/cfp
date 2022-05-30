import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShallListComponent } from './shall-list.component';

describe('ShallListComponent', () => {
  let component: ShallListComponent;
  let fixture: ComponentFixture<ShallListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShallListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShallListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
