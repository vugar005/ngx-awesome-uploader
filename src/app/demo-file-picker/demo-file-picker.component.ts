import {
  FilePickerComponent,
  ValidationError,
  FilePreviewModel,
  UploaderCaptions,
} from 'ngx-awesome-uploader';
import {HttpClient} from '@angular/common/http';
import {DemoFilePickerAdapter} from './demo-file-picker.adapter';
import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {delay, map} from 'rxjs/operators';

@Component({
  selector: 'app-demo-file-picker',
  templateUrl: './demo-file-picker.component.html',
  styleUrls: ['./demo-file-picker.component.scss']
})
export class DemoFilePickerComponent implements OnInit {
  @ViewChild('uploader', { static: true }) uploader: FilePickerComponent;
  adapter = new DemoFilePickerAdapter(this.http);
  myFiles: FilePreviewModel[] = [];
  captions: UploaderCaptions = {
    dropzone: {
      title: 'Fayllari bura ata bilersiz',
      or: 'və yaxud',
      browse: 'Fayl seçin'
    },
    cropper: {
      crop: 'Kəs',
      cancel: 'Imtina'
    },
    previewCard: {
      remove: 'Sil',
      uploadError: 'Fayl yüklənmədi'
    }
  };

  constructor(private http: HttpClient) { }

  public ngOnInit(): void {
  }

  public onValidationError(e: ValidationError): void {
    console.log(e);
  }

  public onUploadSuccess(e: FilePreviewModel): void {
    console.log(e);
  // console.log(this.myFiles)
  }

  public onUploadFail(e: FilePreviewModel): void {
    console.log(e);
  }
  public onRemoveSuccess(e: FilePreviewModel): void {
    console.log();
  }
  public onFileAdded(file: FilePreviewModel): void {
    this.myFiles.push(file);
  }

  public onFileRemoved(file: FilePreviewModel): void {
    console.log(this.uploader.files);
  }

  public removeFile(): void {
    this.uploader.removeFileFromList(this.myFiles[0]);
  }

  public myCustomValidator(file: File): Observable<boolean> {
    if (!file.name.includes('uploader')) {
        return of(true).pipe(delay(2000));
    }
    return of(false).pipe(delay(2000));
}

}
