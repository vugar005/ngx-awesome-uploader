import { FilePickerAdapter } from 'projects/file-picker/src/lib/file-picker.adapter';
import { FilePreviewContainerComponent } from './file-preview-container/file-preview-container.component';
import { FileValidationTypes } from './validation-error.model';
import { FilePickerService } from './file-picker.service';
import { FilePickerModule, FilePreviewModel } from 'projects/file-picker/src/public_api';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { FilePickerComponent } from './file-picker.component';
import { createMockFile, createMockPreviewFile } from './test-utils';
import { FilePreviewItemComponent } from './file-preview-container/file-preview-item/file-preview-item.component';
import { of } from 'rxjs';
export class MockableUploaderAdapter extends FilePickerAdapter {
  public uploadFile(fileItem: FilePreviewModel) {
   return of('123');
  }
    public removeFile(id: string, fileItem: FilePreviewModel) {
      return of('ok');
  }


}
describe('FilePickerComponent', () => {
  let component: FilePickerComponent;
  let componentPreviewItem: FilePreviewItemComponent;
  let componentPreviewContainer: FilePreviewContainerComponent;

  let fixture: ComponentFixture<FilePickerComponent>;
  let fixturePreviewItem: ComponentFixture<FilePreviewItemComponent>;
  let fixturePreviewContainer: ComponentFixture<FilePreviewContainerComponent>;

  let service: FilePickerService;
  let mockFile: File;
  let mockFilePreview: FilePreviewModel;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [FilePickerModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilePickerComponent);
    fixturePreviewItem = TestBed.createComponent(FilePreviewItemComponent);
    fixturePreviewContainer = TestBed.createComponent(FilePreviewContainerComponent);
    component = fixture.componentInstance;
    componentPreviewItem = fixturePreviewItem.componentInstance;
    componentPreviewContainer = fixturePreviewContainer.componentInstance;
    service = new FilePickerService(null);
    fixture.detectChanges();
    component.enableCropper = false;
    mockFile = createMockFile('demo.pdf', 'application/pdf');
    mockFilePreview = createMockPreviewFile('demo.pdf', 'application/pdf');
    componentPreviewItem.adapter = new MockableUploaderAdapter();
  });

  it('should use default cropper options when not provided', () => {
    const spy = spyOn(component, 'setDefaultCropperOptions');
    component.ngOnInit();
    fixture.detectChanges();
    // expect(spy).toHaveBeenCalled();
  });
 it('should not call pushFile on extension validation fails ', () => {
   const spy = spyOn(component, 'pushFile');
   component.fileExtensions = 'doc';
   const file = createMockFile('demo.png', 'image/png');
   component.handleInputFile(file);
   expect(spy).not.toHaveBeenCalled();
 });
 it('should call pushFile on extension validation success ', () => {
   const spy = spyOn(component, 'pushFile');
   component.fileExtensions = 'pdf';
   const file = createMockFile('demo.pdf', 'application/pdf');
   component.handleInputFile(file);
   expect(spy).toHaveBeenCalled();
 });
 it('should open cropper when type is image and cropper enabled', () => {
  const spy = spyOn(component, 'openCropper');
  component.enableCropper = true;
  const file = createMockFile('demo.png', 'image/png');
  component.handleInputFile(file);
  expect(spy).toHaveBeenCalled();
 });
 it('should NOT open cropper when type is not image', () => {
  const spy = spyOn(component, 'openCropper');
  component.enableCropper = true;
  const file = createMockFile('demo.pdf', 'application/pdf');
  component.handleInputFile(file);
  expect(spy).not.toHaveBeenCalled();
 });
 it('should NOT open cropper when cropper is not enabled', () => {
  const spy = spyOn(component, 'openCropper');
  component.enableCropper = false;
  const file = createMockFile('demo.png', 'image/png');
  component.handleInputFile(file);
  expect(spy).not.toHaveBeenCalled();
 });
 it('should NOT push file on size validation fail without cropper feature', () => {
   const spy = spyOn(component, 'pushFile');
   component.fileMaxSize = 1;
   const file = createMockFile('demo.png', 'image/png', 1.1);
   component.handleInputFile(file);
   expect(spy).not.toHaveBeenCalled();
 });

 it('should NOT push file on fileMaxCount validation fail', () => {
   const spy = spyOn(component, 'pushFile');
   component.fileMaxCount = 1;
   component.files.push(createMockPreviewFile('demo.png', 'image/png'));
   const file = createMockFile('demo2.png', 'image/png');
   component.handleInputFile(file);
   expect(spy).not.toHaveBeenCalled();
 });
 it('should NOT push another file when upload type is single', () => {
   const spy = spyOn(component, 'pushFile');
   component.uploadType = 'single';
   component.files.push(createMockPreviewFile('demo.png', 'image/png'));
   const file = createMockFile('demo2.png', 'image/png');
   component.handleInputFile(file);
   expect(spy).not.toHaveBeenCalled();
 });
 it('should isValidMaxExtension work', () => {
  component.fileExtensions = 'pdf';
  spyOn(component.validationError, 'next');
  const file = createMockFile('demo2.png', 'image/png');
  const res =  component.isValidExtension(file, file.name);
  expect(res).toBe(false);
  expect(component.validationError.next).toHaveBeenCalledWith({file: file, error: FileValidationTypes.extensions});

});
 it('should isValidMaxFileCount work', () => {
  component.fileMaxCount = 1;
  spyOn(component.validationError, 'next');
  const fileItem = createMockPreviewFile('demo2.png', 'image/png');
  component.files.push(fileItem);
  const res =  component.isValidMaxFileCount(<File>fileItem.file);
  expect(res).toBe(false);
  expect(component.validationError.next).toHaveBeenCalledWith({file: fileItem.file, error: FileValidationTypes.fileMaxCount});

});
it('should isValidSize work', () => {
  component.fileMaxSize = 1;
  spyOn(component.validationError, 'next');
  const fileItem = createMockPreviewFile('demo2.png', 'image/png', 1.2);
  const res =  component.isValidSize(<File>fileItem.file, fileItem.file.size);
  expect(res).toBe(false);
  expect(component.validationError.next).toHaveBeenCalledWith({file: fileItem.file, error: FileValidationTypes.fileMaxSize});
});
it('should isValidUploadType work', () => {
  component.uploadType = 'single';
  const fileItem = createMockPreviewFile('demo2.png', 'image/png', 1.2);
  spyOn(component.validationError, 'next');
  component.files.push(fileItem);
  const res =  component.isValidUploadType(<File>fileItem.file);
  expect(res).toBe(false);
  expect(component.validationError.next).toHaveBeenCalledWith({file: fileItem.file, error: FileValidationTypes.uploadType});
});
it('should have default dragDropZone and preview container', () => {
 expect(component.showeDragDropZone).toBe(true);
 expect(component.showPreviewContainer).toBe(true);
});
it('cropper feature should be disabled by default', () => {
 expect(component.enableCropper).toBe(false);
});
it('should upload type be multi by default', () => {
 expect(component.uploadType).toBe('multi');
});
it('shoud start uploading  when file is added', fakeAsync(() => {
  const spy = spyOn(componentPreviewItem, 'uploadFile');
  componentPreviewItem.fileItem  = mockFilePreview;
  componentPreviewItem.ngOnInit();
  expect(spy).toHaveBeenCalled();
}));
it('shoud emit uploadSuccess when file is uploaded successfully', fakeAsync(() => {
  spyOn(componentPreviewItem.uploadSuccess, 'next');
  spyOn(component.uploadSuccess, 'next');
  spyOn(MockableUploaderAdapter.prototype, 'uploadFile').and.returnValue(of('123'));
  componentPreviewItem.fileItem  = mockFilePreview;
  componentPreviewItem.ngOnInit();
  fixturePreviewItem.detectChanges();
  fixture.detectChanges();
  tick(1000);
  fixture.whenStable().then(res => {
    fixturePreviewItem.detectChanges();
    fixture.detectChanges();
   // expect(component.uploadSuccess.next).toHaveBeenCalled();
    expect(componentPreviewItem.uploadSuccess.next).toHaveBeenCalled();
  });
}));

});
