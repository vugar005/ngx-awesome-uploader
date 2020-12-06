import { FilePreviewModel } from './file-preview.model';
import { Observable } from 'rxjs';

export interface UploadStatus {
    body?: any;
    status: 'Response' | 'Progress';
    progress?: number;
}

export abstract class FilePickerAdapter {
 public abstract uploadFile(fileItem: FilePreviewModel): Observable<UploadStatus>;
 public abstract removeFile(fileItem: FilePreviewModel): Observable<any>;
}
