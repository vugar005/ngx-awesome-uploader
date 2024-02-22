import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { FilePickerAdapter, UploadResponse, UploadStatus } from '../../file-picker.adapter';
import { FilePickerService } from '../../file-picker.service';
import { FilePreviewModel } from '../../file-preview.model';
import { createMockPreviewFile } from '../../test-utils';
import { FilePreviewItemComponent } from './file-preview-item.component';

class MockUploaderAdapter extends FilePickerAdapter {
  public uploadFile(fileItem: FilePreviewModel): Observable<UploadResponse> {
    return of({ body: 50, status: UploadStatus.UPLOADED });
  }
  public removeFile(fileItem: FilePreviewModel) {
    return of('ok');
  }
}

describe('FilePreviewComponent', () => {
  let component: FilePreviewItemComponent;
  let fixture: ComponentFixture<FilePreviewItemComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilePreviewItemComponent],
      providers: [FilePickerService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilePreviewItemComponent);
    component = fixture.componentInstance;
    component.fileItem = createMockPreviewFile('test.png', 'image/', 10);
    component.uploadSuccess.next = jasmine.createSpy('uploadSuccess');
    component.uploadFail.next = jasmine.createSpy('uploadFail');
    component.removeFile.next = jasmine.createSpy('removeFile');
  });

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should itemTemplate be undefined by default', () => {
    expect(component.itemTemplate).toBeUndefined();
  });

  it('should captions be undefined by default', () => {
    expect(component.captions).toBeUndefined();
  });

  it('should adapter be undefined by default', () => {
    expect(component.adapter).toBeUndefined();
  });

  it('should enableAutoUpload be undefined by default', () => {
    expect(component.enableAutoUpload).toBeUndefined();
  });

  it('should uploadProgress be undefined by default', () => {
    expect(component.uploadProgress).toBeUndefined();
  });
  it('should fileType be undefined by default', () => {
    expect(component.fileType).toBeUndefined();
  });

  it('should safeUrl be undefined by default', () => {
    expect(component.safeUrl).toBeUndefined();
  });

  it('should uploadError be undefined by default', () => {
    expect(component.uploadError).toBeUndefined();
  });

  it('should uploadResponse be undefined by default', () => {
    expect(component.uploadResponse).toBeUndefined();
  });

  describe('#ngOnInit', () => {
    it('should safeUrl be defined', () => {
      component.ngOnInit();
      expect(component.safeUrl).toBeDefined();
    });

    it('should fileType be defined', () => {
      component.ngOnInit();
      expect(component.fileType).toEqual('PNG');
    });

    describe('and uploadFile', () => {
      describe('and enableAutoUpload is true', () => {
        beforeEach(() => {
          component.enableAutoUpload = true;
        });

        describe('and adapter exist', () => {
          beforeEach(() => {
            component.adapter = new MockUploaderAdapter();
            spyOn(component.adapter, 'uploadFile');
            (component.adapter.uploadFile as any).and.returnValue(of({ body: 10, status: UploadStatus.UPLOADED }));
          });
          it('should upload file', () => {
            component.ngOnInit();
            expect(component.adapter.uploadFile).toHaveBeenCalled();
          });
          describe('and upload resposne type is UPLOADED', () => {
            let uploadResponse;
            beforeEach(() => {
              uploadResponse = { id: 12 };
              (component.adapter.uploadFile as any).and.returnValue(
                of({ body: uploadResponse, status: UploadStatus.UPLOADED })
              );
            });
            it('should uploadResponse be defined', () => {
              component.ngOnInit();
              expect(component.uploadResponse).toEqual(uploadResponse);
            });

            it('should uploadProgress be undefined', () => {
              component.ngOnInit();
              expect(component.uploadProgress).toBeUndefined();
            });

            it('should emit uploadSuccess', () => {
              component.ngOnInit();
              expect(component.uploadSuccess.next).toHaveBeenCalledWith({
                ...component.fileItem,
                uploadResponse,
              });
            });
          });

          describe('and upload resposne type is IN_PROGRESS', () => {
            beforeEach(() => {
              (component.adapter.uploadFile as any).and.returnValue(
                of({ progress: 10, status: UploadStatus.IN_PROGRESS })
              );
            });
            it('should uploadProgress be defined', () => {
              component.ngOnInit();
              expect(component.uploadProgress).toBe(10);
            });
          });

          describe('and upload resposne type is ERROR', () => {
            let error;
            beforeEach(() => {
              error = 'some-error';
              (component.adapter.uploadFile as any).and.returnValue(of({ body: error, status: UploadStatus.ERROR }));
            });
            it('should uploadError be true', () => {
              component.ngOnInit();
              expect(component.uploadError).toBe(true);
            });
            it('should uploadProgress be undefined', () => {
              component.ngOnInit();
              expect(component.uploadProgress).toBeUndefined();
            });
            it('should uploadFail be emitted', () => {
              component.ngOnInit();
              expect(component.uploadFail.next).toHaveBeenCalledWith(error);
            });
          });
        });
      });

      describe('and enableAutoUpload is false', () => {
        beforeEach(() => {
          component.enableAutoUpload = false;
        });

        describe('and adapter exist', () => {
          beforeEach(() => {
            component.adapter = new MockUploaderAdapter();
            spyOn(component.adapter, 'uploadFile');
            (component.adapter.uploadFile as any).and.returnValue(of({ body: 10, status: UploadStatus.UPLOADED }));
          });
          it('should NOT upload file', () => {
            component.ngOnInit();
            expect(component.adapter.uploadFile).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('#onRemove', () => {
    beforeEach(() => {
      component.uploadResponse = { id: 10 };
    });
    it('should removeFile be emitted', () => {
      component.onRemove(component.fileItem);
      expect(component.removeFile.next).toHaveBeenCalledWith({
        ...component.fileItem,
        uploadResponse: component.uploadResponse,
      });
    });
  });
});
