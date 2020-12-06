import { FilePreviewModel } from './../../../projects/file-picker/src/lib/file-preview.model';
import { HttpRequest, HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FilePickerAdapter, UploadStatus } from 'projects/file-picker/src/lib/file-picker.adapter';

export class DemoFilePickerAdapter extends FilePickerAdapter {
  constructor(private http: HttpClient) {
    super();
  }
  public uploadFile(fileItem: FilePreviewModel): Observable<UploadStatus> {
    const form = new FormData();
    form.append('file', fileItem.file);
    const api = 'https://ngx-awesome-uploader.free.beeceptor.com';
    const req = new HttpRequest('POST', api, form, {reportProgress: true});
    return this.http.request(req)
    .pipe(
      map( (res: HttpEvent<any>) => {
        if (res.type === HttpEventType.Response) {
          return {
            body: res.body,
            status: 'Response'
          };
        } else if (res.type ===  HttpEventType.UploadProgress) {
          /** Compute and show the % done: */
            const uploadProgress = +Math.round((100 * res.loaded) / res.total);
            return {
              status: 'Progress',
              progress: uploadProgress
            };
        }
      })
      );
  }
    public removeFile(fileItem: FilePreviewModel): Observable<any> {
      console.log(fileItem.fileId);
      const removeApi = 'https://file-remove-demo.free.beeceptor.com';
      return this.http.post(removeApi, {id: fileItem.fileId});
    }
}
