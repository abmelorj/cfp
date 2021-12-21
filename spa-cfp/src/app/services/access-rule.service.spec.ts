import { TestBed } from '@angular/core/testing';

import { AccessRuleService } from './access-rule.service';

describe('AccessRuleService', () => {
  let service: AccessRuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessRuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
