import { FilePreviewModel } from './file-preview.model';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

export function createMockFile(name: string, type: string, sizeInMb = 1): File {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: 1048576 * sizeInMb });
  return file;
}

export function createMockPreviewFile(name: string, type: string, sizeInMb = 1): FilePreviewModel {
  const file = createMockFile(name, type, sizeInMb);
  return { file, fileName: name };
}

export function mockCustomValidator(file: File): Observable<boolean> {
  console.log(file.name.length);
  if (!file.name.includes('uploader')) {
    return of(true).pipe(delay(2000));
  }
  return of(false).pipe(delay(2000));
}
