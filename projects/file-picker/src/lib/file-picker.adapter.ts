import { FilePreviewModel } from './file-preview.model';
import { Observable } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

export abstract class FilePickerAdapter {
 public abstract uploadFile(fileItem: FilePreviewModel): Observable<HttpEvent<any> | string>;
 public abstract removeFile(id: string, fileItem: FilePreviewModel): Observable<any>;
}
