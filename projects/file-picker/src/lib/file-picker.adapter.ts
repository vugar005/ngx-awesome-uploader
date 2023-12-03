import { FilePreviewModel } from './file-preview.model';
import { Observable } from 'rxjs';

export interface UploadResponse {
    body?: any;
    status: UploadStatus;
    progress?: number;
}

export enum UploadStatus {
   UPLOADED = 'UPLOADED',
   IN_PROGRESS = 'IN PROGRESS',
   ERROR = 'ERROR'
}

export abstract class FilePickerAdapter {
 public abstract uploadFile(fileItem: FilePreviewModel): Observable<UploadResponse | undefined>;
 public abstract removeFile(fileItem: FilePreviewModel): Observable<any>;
}
