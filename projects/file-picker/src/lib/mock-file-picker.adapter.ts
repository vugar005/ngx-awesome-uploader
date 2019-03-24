import { FilePreviewModel } from 'ngx-awesome-uploader';
import { HttpRequest, HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FilePickerAdapter } from 'ngx-awesome-uploader';

export class DemoFilePickerAdapter extends FilePickerAdapter {
  constructor(private http: HttpClient) {
    super();
  }
  public uploadFile(fileItem: FilePreviewModel) {
    const form = new FormData();
    form.append('file', fileItem.file);
    const api = 'https://file-picker-demo.free.beeceptor.com';
    const req = new HttpRequest('POST', api, form, {reportProgress: true});
    return this.http.request(req)
    .pipe(
      map( (res: HttpEvent<any>) => {
        if (res.type === HttpEventType.Response) {
          return res.body.id.toString();
        } else if (res.type ===  HttpEventType.UploadProgress) {
            // Compute and show the % done:
            const UploadProgress = +Math.round((100 * res.loaded) / res.total);
            return UploadProgress;
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
