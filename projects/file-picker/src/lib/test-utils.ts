import { FilePreviewModel } from './file-preview.model';
import { FilePickerAdapter } from './file-picker.adapter';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

export function createMockFile(name: string, type: string, sizeInMb = 1) {
  return {
    name: name,
    type: type,
    size: sizeInMb * 1048576,
    lastModified: 1,
    lastModifiedDate: new Date(),
    webkitRelativePath: '',
    msClose: () => {},
    msDetachStream: () => {},
    slice: (): Blob => null
  };
}

export function createMockPreviewFile(name: string, type: string, sizeInMb = 1): FilePreviewModel {
  const file =  {
    name: name,
    type: type,
    size: sizeInMb * 1048576,
    lastModified: 1,
    lastModifiedDate: new Date(),
    webkitRelativePath: '',
    msClose: () => {},
    msDetachStream: () => {},
    slice: (): Blob => null
  };
  return {file: file, fileName: name};
}

export function mockCustomValidator(file: File): Observable<boolean> {
  console.log(file.name.length);
 if (!file.name.includes('uploader')) {
    return of(true).pipe(delay(2000));
 }
  return of(false).pipe(delay(2000));
}
