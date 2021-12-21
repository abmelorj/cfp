import { TestBed } from '@angular/core/testing';

import { AccessGrantService } from './access-grant.service';

describe('AccessGrantService', () => {
  let service: AccessGrantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessGrantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
