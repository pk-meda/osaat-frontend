import { TestBed } from '@angular/core/testing';

import { Station } from './station.service';

describe('Station', () => {
  let service: Station;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Station);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
