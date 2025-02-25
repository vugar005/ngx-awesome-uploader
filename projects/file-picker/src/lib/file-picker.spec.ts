import { FilePickerAdapter, UploadResponse, UploadStatus } from 'projects/file-picker/src/lib/file-picker.adapter';
import { FilePreviewContainerComponent } from './file-preview-container/file-preview-container.component';
import { FileValidationTypes } from './validation-error.model';
import { FilePickerService } from './file-picker.service';
import { FilePickerModule, FilePreviewModel } from 'projects/file-picker/src/public_api';
import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { FilePickerComponent } from './file-picker.component';
import { createMockFile, createMockPreviewFile, mockCustomValidator } from './test-utils';
import { Observable, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DEFAULT_CROPPER_OPTIONS } from './file-picker.constants';

export class MockableUploaderAdapter extends FilePickerAdapter {
  public uploadFile(fileItem: FilePreviewModel): Observable<UploadResponse> {
   return of({body: 50, status: UploadStatus.UPLOADED});
  }
    public removeFile(fileItem: FilePreviewModel) {
      return of('ok');
  }
}
describe('FilePickerComponent', () => {
  let component: FilePickerComponent;
  let fixture: ComponentFixture<FilePickerComponent>;
  let service: FilePickerService;
  let mockFile: File;
  let mockFilePreview: FilePreviewModel;
  (window as any).UPLOADER_TEST_MODE = true;
  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [FilePickerModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [FilePickerService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilePickerComponent);
    component = fixture.componentInstance;
    service = new FilePickerService(null);
    fixture.detectChanges();
    mockFile = createMockFile('demo.pdf', 'application/pdf');
    mockFilePreview = createMockPreviewFile('demo.pdf', 'application/pdf');
    component.fileAdded.next = jasmine.createSpy('fileAdded');
    component.validationError.next = jasmine.createSpy('validationError');
  });

  it('should enableCropper be false by default', () => {
    component.ngOnInit();
    expect(component.enableCropper).toBe(false);
  });

  it('should showDragDropZone be true by default', () => {
    component.ngOnInit();
    expect(component.showeDragDropZone).toBe(true);
  });

  it('should showPreviewContainer be true by default', () => {
    component.ngOnInit();
    expect(component.showPreviewContainer).toBe(true);
  });

  it('should uploadType be multi by default', () => {
    component.ngOnInit();
    expect(component.uploadType).toBe('multi');
  });

  it('should itemTemplate be undefined by default', () => {
    component.ngOnInit();
    expect(component.itemTemplate).toBeUndefined();
  });

  it('should fileMaxSize be undefined by default', () => {
    component.ngOnInit();
    expect(component.fileMaxSize).toBeUndefined();
  });

  it('should fileMaxCount be undefined by default', () => {
    component.ngOnInit();
    expect(component.fileMaxCount).toBeUndefined();
  });

  it('should totalMaxSize be undefined by default', () => {
    component.ngOnInit();
    expect(component.totalMaxSize).toBeUndefined();
  });

  it('should enableAutoUpload be true by default', () => {
    component.ngOnInit();
    expect(component.enableAutoUpload).toBe(true);
  });

  it('should use default cropper options when not provided', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.cropperOptions).toEqual(DEFAULT_CROPPER_OPTIONS);
  });

  describe('#onChange', () => {
    describe('and isValidMaxFileCount', () => {
      let file1: File;
      let file2: File;
      beforeEach(() => {
         file1 = createMockFile('demo.png', 'image/png', 5);
         file2 = createMockFile('demo-2.png', 'image/png', 10);
         component.fileMaxCount = 2;
      });
      describe('and isValidUploadType true', () => {
        beforeEach(() => {
          component.uploadType = 'multi';
        });

        describe('and isValidExtension true', () => {
          beforeEach(() => {
            component.fileExtensions = ['png'];
          });

          describe('and async validations valid', () => {
            beforeEach(() => {
              component.customValidator = () => of(true);
            });

            describe('and cropper is disabled', () => {
              beforeEach(() => {
                component.enableCropper = false;
              });
              describe('and isValidSize', () => {
                beforeEach(() => {
                  component.fileMaxSize = 50;
                });
                it('should push files to fileList', () => {
                  const files = [ file1, file2 ] as File[];
                  component.onChange(files);
                  expect(component.files).toEqual([
                    {file: file1, fileName: file1.name},
                    {file: file2, fileName: file2.name}
                  ]);
                });

                it('should fileAdded emit file', () => {
                  const files = [ file1 ] as File[];
                  component.onChange(files);
                  expect(component.fileAdded.next).toHaveBeenCalledWith({file: file1, fileName: file1.name});
                });

                it('should NOT emit validationError with size error', () => {
                  const files = [ file1 ] as File[];
                  component.onChange(files);
                  expect(component.validationError.next).not.toHaveBeenCalled();
                });
              });
              describe('and NOT isValidSize', () => {
                beforeEach(() => {
                  file1 = createMockFile('demo.png', 'image/png', 10);
                  component.fileMaxSize = 6;
                });
                it('should NOT push files to fileList', () => {
                  const files = [ file1 ] as File[];
                  component.onChange(files);
                  expect(component.files).toEqual([]);
                });

                it('should fileAdded NOT emit file', () => {
                  const files = [ file1 ] as File[];
                  component.onChange(files);
                  expect(component.fileAdded.next).not.toHaveBeenCalled();
                });

                it('should emit validationError with size error', () => {
                  const files = [ file1 ] as File[];
                  component.onChange(files);
                  expect(component.validationError.next).toHaveBeenCalledWith({
                    file: file1,
                    error: FileValidationTypes.fileMaxSize
                  });
                });

              });
            });

            describe('and cropper is enabled', () => {
              beforeEach(() => {
                component.enableCropper = true;
                component.currentCropperFile = undefined;
                (window as any).CROPPER = true;
              });
              it('should filesForCropper be defined', () => {
                const files = [ file1 ] as File[];
                component.onChange(files);
                expect(component.filesForCropper).toEqual([file1]);
              });

              it('should set currentCropperFile', () => {
                const files = [ file1 ] as File[];
                component.onChange(files);
                expect(component.currentCropperFile).toEqual(file1);
              });

              it('should set safeCropImgUrl', () => {
                const files = [ file1 ] as File[];
                component.onChange(files);
                expect(component.safeCropImgUrl).toBeDefined();
              });
            });
          });
        });

        describe('and isValidExtension false', () => {
          beforeEach(() => {
            component.fileExtensions = ['ttgt'];
          });

          describe('and async validations valid', () => {
            beforeEach(() => {
              component.customValidator = () => of(true);
            });

            describe('and cropper is disabled', () => {
              beforeEach(() => {
                component.enableCropper = false;
              });
              describe('and isValidSize be true', () => {
                beforeEach(() => {
                  component.fileMaxSize = 50;
                });
                it('should NOT  push files to fileList', () => {
                  const files = [ file1, file2 ] as File[];
                  component.onChange(files);
                  expect(component.files).toEqual([]);
                });

                it('should fileAdded NOT emit file', () => {
                  const files = [ file1 ] as File[];
                  component.onChange(files);
                  expect(component.fileAdded.next).not.toHaveBeenCalled();
                });

              });
              describe('and NOT isValidSize', () => {
                beforeEach(() => {
                  file1 = createMockFile('demo.png', 'image/png', 10);
                  component.fileMaxSize = 6;
                });
                it('should NOT push files to fileList', () => {
                  const files = [ file1 ] as File[];
                  component.onChange(files);
                  expect(component.files).toEqual([]);
                });

                it('should fileAdded NOT emit file', () => {
                  const files = [ file1 ] as File[];
                  component.onChange(files);
                  expect(component.fileAdded.next).not.toHaveBeenCalled();
                });
              });
            });

            describe('and cropper is enabled', () => {
              beforeEach(() => {
                component.enableCropper = true;
                component.currentCropperFile = undefined;
                (window as any).CROPPER = true;
              });
              it('should filesForCropper NOT be defined', () => {
                const files = [ file1 ] as File[];
                component.onChange(files);
                expect(component.filesForCropper).toEqual([]);
              });

              it('should NOT set currentCropperFile', () => {
                const files = [ file1 ] as File[];
                component.onChange(files);
                expect(component.currentCropperFile).not.toBeDefined();
              });

              it('should NOT set safeCropImgUrl', () => {
                const files = [ file1 ] as File[];
                component.onChange(files);
                expect(component.safeCropImgUrl).not.toBeDefined();
              });
            });
          });
        });
      });
    });
  });

  it('should open cropper when type is image and cropper enabled', async () => {
  const spy = spyOn(component, 'openCropper');
  component.enableCropper = true;
  const file = createMockFile('demo.png', 'image/png');
  await component.handleFiles([file]).toPromise();
  expect(spy).toHaveBeenCalled();
 });

  it('should NOT open cropper when type is not image', async () => {
  const spy = spyOn(component, 'openCropper');
  component.enableCropper = true;
  const file = createMockFile('demo.pdf', 'application/pdf');
  await component.handleFiles([file]).toPromise();
  expect(spy).not.toHaveBeenCalled();
 });

  it('should NOT open cropper when cropper is not enabled', async () => {
  const spy = spyOn(component, 'openCropper');
  component.enableCropper = false;
  const file = createMockFile('demo.png', 'image/png');
  await  component.handleFiles([file]).toPromise();
  expect(spy).not.toHaveBeenCalled();
 });

  it('should NOT push file on size validation fail without cropper feature', () => {
   const spy = spyOn(component, 'pushFile');
   component.fileMaxSize = 1;
   const file = createMockFile('demo.png', 'image/png', 1.1);
   component.handleFiles([file]).toPromise();
   expect(spy).not.toHaveBeenCalled();
 });

  it('should NOT push file on fileMaxCount validation fail', () => {
   const spy = spyOn(component, 'pushFile');
   component.fileMaxCount = 1;
   component.files.push(createMockPreviewFile('demo.png', 'image/png'));
   expect(spy).not.toHaveBeenCalled();
 });
  it('should NOT push another file when upload type is single',  async () => {
   const spy = spyOn(component, 'pushFile');
   component.uploadType = 'single';
   component.files.push(createMockPreviewFile('demo.png', 'image/png'));
   const file = createMockFile('demo2.png', 'image/png');
   await component.handleFiles([file]).toPromise();
   expect(spy).not.toHaveBeenCalled();
 });

  it('should push images to filesForCropper if cropper Enabled', fakeAsync(async () => {
    component.enableCropper = true;
    const files = [createMockFile('test.jpg', 'image/jpeg'), createMockFile('test2.png', 'image/png')];
    await component.handleFiles(files).toPromise();
    expect(component.filesForCropper.length).toBe(2);
}));

  xit('should open cropper as many times as image length on multi mode', fakeAsync(async () => {
    spyOn(component, 'openCropper').and.callThrough();
    spyOn(component, 'closeCropper').and.callThrough();
    component.enableCropper = true;
    const files = [createMockFile('test.jpg', 'image/jpeg'), createMockFile('test2.png', 'image/png')];
    await component.handleFiles(files).toPromise();
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.cropCancel')).nativeElement.click();
    tick(1000);
    fixture.whenStable().then(res => {
      fixture.detectChanges();
      expect(component.openCropper).toHaveBeenCalledTimes(2);
    });
}));

});
