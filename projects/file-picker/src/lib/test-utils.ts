import { FilePreviewModel } from './file-preview.model';
import { FilePickerAdapter } from './file-picker.adapter';
import { of } from 'rxjs';
// image/png

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
