import { FilePreviewModel } from './../../../projects/file-picker/src/lib/file-preview.model';
import { HttpRequest, HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FilePickerAdapter } from 'projects/file-picker/src/lib/file-picker.adapter';

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
          return res.body.id;
        } else {
          return res;
        }
      })
      );
  }
    public removeFile(id: string, fileItem: FilePreviewModel): Observable<any> {
      console.log(fileItem.fileId);
    const removeApi = 'https://file-remove-demo.free.beeceptor.com';
    return this.http.post(removeApi, {id: fileItem.fileId});
    }
}
