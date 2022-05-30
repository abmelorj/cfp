import { TestBed } from '@angular/core/testing';

import { ShallService } from './shall.service';

describe('ShallService', () => {
  let service: ShallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
