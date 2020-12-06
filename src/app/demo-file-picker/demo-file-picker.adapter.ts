import { FilePreviewModel } from './../../../projects/file-picker/src/lib/file-preview.model';
import { HttpRequest, HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { FilePickerAdapter, UploadResponse, UploadStatus } from 'projects/file-picker/src/lib/file-picker.adapter';

export class DemoFilePickerAdapter extends FilePickerAdapter {
  constructor(private http: HttpClient) {
    super();
  }
  public uploadFile(fileItem: FilePreviewModel): Observable<UploadResponse> {
    const form = new FormData();
    form.append('file', fileItem.file);
    const api = 'https://run.mocky.io/v3/f4bee334-cd93-4fc8-b9ba-46ee0a0251f9';
    const req = new HttpRequest('POST', api, form, {reportProgress: true});
    return this.http.request(req)
    .pipe(
      map((res: HttpEvent<any>) => {
        if (res.type === HttpEventType.Response) {
          return {
            body: res.body,
            status: UploadStatus.UPLOADED
          };
        } else if (res.type ===  HttpEventType.UploadProgress) {
          /** Compute and show the % done: */
            const uploadProgress = +Math.round((100 * res.loaded) / res.total);
            return {
              status: UploadStatus.IN_PROGRESS,
              progress: uploadProgress
            };
        }
      }),
      catchError(er => {
        console.log(er);
        return of({status: UploadStatus.ERROR, body: er });
      })
      );
  }
    public removeFile(fileItem: FilePreviewModel): Observable<any> {
      const id = 50;
      console.log(fileItem);
      const removeApi = 'https://run.mocky.io/v3/dedf88ec-7ce8-429a-829b-bd2fc55352bc';
      return this.http.post(removeApi, {id});
    }
}
