import { TestBed } from '@angular/core/testing';

import { FileValidatorService } from './file-validator.service';

describe('FileValidatorService', () => {
  let service: FileValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
