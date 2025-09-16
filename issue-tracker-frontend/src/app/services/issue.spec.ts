import { TestBed } from '@angular/core/testing';

import { Issue } from './issue';

describe('Issue', () => {
  let service: Issue;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Issue);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
