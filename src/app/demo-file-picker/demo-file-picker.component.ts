import {FilePickerComponent} from './../../../projects/file-picker/src/lib/file-picker.component';
import {ValidationError} from './../../../projects/file-picker/src/lib/validation-error.model';
import {FilePreviewModel} from './../../../projects/file-picker/src/lib/file-preview.model';
import {HttpClient} from '@angular/common/http';
import {DemoFilePickerAdapter} from './demo-file-picker.adapter';
import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {delay, map} from 'rxjs/operators';
import {UploaderCaptions} from 'projects/file-picker/src/public_api';

@Component({
  selector: 'demo-file-picker',
  templateUrl: './demo-file-picker.component.html',
  styleUrls: ['./demo-file-picker.component.scss']
})
export class DemoFilePickerComponent implements OnInit {
  @ViewChild('uploader', { static: true }) uploader: FilePickerComponent;
  adapter = new DemoFilePickerAdapter(this.http);
  myFiles: FilePreviewModel[] = [];
  captions: UploaderCaptions = {
    dropzone: {
      title: "Fayllari bura ata bilersiz",
      or: "və yaxud",
      browse: "Fayl seçin"
    },
    cropper: {
      crop: "Kəs",
      cancel:"Imtina"
    },
    previewCard: {
      remove: "Sil",
      uploadError: "Fayl yüklənmədi"
    }
  }
  constructor(private http: HttpClient) { }

  ngOnInit() {
  }
  onValidationError(e: ValidationError) {
    console.log(e);
  }
  onUploadSuccess(e: FilePreviewModel) {
    console.log(e);
  // console.log(this.myFiles)
  }

  onUploadFail(e: FilePreviewModel) {
    console.log(e);
  }
  onRemoveSuccess(e: FilePreviewModel) {
    console.log();
  }
  onFileAdded(file: FilePreviewModel) {
    console.log(this.uploader.files)
    this.myFiles.push(file);
  }

  onFileRemoved(file: FilePreviewModel) {
    console.log(this.uploader.files)
  }

  removeFile() {
  this.uploader.removeFileFromList(this.myFiles[0]);
  }
   myCustomValidator(file: File): Observable<boolean> {
      if (!file.name.includes('uploader')) {
         return of(true).pipe(delay(2000));
      }
     return of(false).pipe(delay(2000));
  }

}
