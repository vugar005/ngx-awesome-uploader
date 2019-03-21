import { FilePreviewModel } from './file-preview.model';
import { Observable } from 'rxjs';

export abstract class FilePickerAdapter {
 public abstract uploadFile(fileItem: FilePreviewModel): Observable<number| string>;
 public abstract removeFile(fileItem: FilePreviewModel): Observable<any>;
}
