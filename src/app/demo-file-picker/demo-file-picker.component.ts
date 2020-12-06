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
  public adapter = new DemoFilePickerAdapter(this.http);
  public myFiles: FilePreviewModel[] = [];
  public captions: UploaderCaptions = {
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
    // this.uploader.files = [
    //   {
    //     fileName: 'My File 1 for edit.png', file: null
    //   },
    //   {
    //     fileName: 'My File 2 for edit.xlsx', file: null
    //   }
    // ] as FilePreviewModel[];
  }

  public onValidationError(er: ValidationError): void {
    console.log('validationError', er);
  }

  public onUploadSuccess(res: FilePreviewModel): void {
    console.log('uploadSuccess', res);
  // console.log(this.myFiles)
  }

  public onUploadFail(er: FilePreviewModel): void {
    console.log('uploadFail', er);
  }

  public onRemoveSuccess(res: FilePreviewModel): void {
    console.log('removeSuccess', res);
  }

  public onFileAdded(file: FilePreviewModel): void {
    console.log('fileAdded', file);
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
        return of(true).pipe(delay(100));
    }
    return of(false).pipe(delay(100));
}

public clearAllFiles(): void {
  this.uploader.files = [];
}

public onRemoveFile(fileItem: FilePreviewModel): void {
  console.log(fileItem);
  this.uploader.removeFile(fileItem);
}
}
