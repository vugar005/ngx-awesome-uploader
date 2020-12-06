import { FilePickerService } from './../../file-picker.service';
import { FilePreviewModel } from './../../file-preview.model';
import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { getFileType} from '../../file-upload.utils';
import {  Subscription } from 'rxjs';
import { FilePickerAdapter, UploadStatus } from '../../file-picker.adapter';
import { UploaderCaptions } from '../../uploader-captions';

@Component({
  selector: 'file-preview-item',
  templateUrl: './file-preview-item.component.html',
  styleUrls: ['./file-preview-item.component.scss']
})
export class FilePreviewItemComponent implements OnInit {
  @Output() public removeFile = new EventEmitter<FilePreviewModel>();
  @Output() public uploadSuccess = new EventEmitter<FilePreviewModel>();
  @Output() public uploadFail = new EventEmitter<HttpErrorResponse>();
  @Output() public imageClicked = new EventEmitter<FilePreviewModel>();
  @Input() public fileItem: FilePreviewModel;
  @Input() adapter: FilePickerAdapter;
  @Input() itemTemplate: TemplateRef<any>;
  @Input() captions: UploaderCaptions;
  @Input() enableAutoUpload: boolean;
  icon = 'checkmark';
  uploadProgress: number;
  fileType: string;
  safeUrl: SafeResourceUrl;
  uploadError: boolean;
  uploadSubscription: Subscription;
  fileId: string;
  constructor(
    private fileService: FilePickerService,
  ) {}

  ngOnInit() {
  this.uploadFile(this.fileItem);
  this.fileType = getFileType(this.fileItem.file.type);
  this.safeUrl = this.getSafeUrl(this.fileItem.file);
  }
  getSafeUrl(file: File | Blob): SafeResourceUrl {
    return this.fileService.createSafeUrl(file);
  }
  /** Converts bytes to nice size */
  niceBytes(x): string {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0;
    let n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
      n = n / 1024;
    }
    // include a decimal point and a tenths-place digit if presenting
    // less than ten of KB or greater units
    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
  }
  /** Retry file upload when upload was unsuccessfull */
  onRetry(): void {
    this.uploadFile(this.fileItem);
  }
  onCheckMarkClick() {
    this.icon = 'error';
  }
  uploadFile(fileItem: FilePreviewModel): void {
    if (!this.enableAutoUpload) {
      return;
    }
    if (this.adapter) {
      this.uploadSubscription =
      this.adapter.uploadFile(fileItem)
      .subscribe((res: UploadStatus) => {
        if (res && res.status === 'Response') {
          this.onUploadSuccess(res.body, fileItem);
          this.uploadProgress = undefined;
        }
        if (res && res.status === 'Progress') {
          this.uploadProgress = res.progress;
        //  this.handleProgressResponse(<HttpEvent<any>>res, fileItem);
        }
      }, (er: HttpErrorResponse) => {
        this.uploadError = true;
        this.uploadFail.next(er);
        this.uploadProgress = undefined;
  });
    } else {
      console.warn('no adapter was provided');
    }
  }
  /** Emits event when file upload api returns success  */
  onUploadSuccess(id: string, fileItem: FilePreviewModel): void {
    this.fileId = id;
    this.fileItem.fileId = id;
    this.uploadSuccess.next({...fileItem, fileId: id});
  }
  handleProgressResponse(event: HttpEvent<any> , fileName) {
    switch (event.type) {
      case HttpEventType.Sent:
        return ;

      case HttpEventType.UploadProgress:
        // Compute and show the % done:
        this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        return;

      case HttpEventType.Response:
        const body: any = event.body;
        if (body && body.data) {
         // this.uploaded.next(res.data.toString());
        }
        this.uploadProgress = undefined;
        return;
      default:
        this.uploadProgress = undefined;
        return `File "${fileName}" surprising upload event: ${event.type}.`;
    }
  }
 onRemove(fileItem: FilePreviewModel): void {
  this.uploadUnsubscribe();
  this.removeFile.next(fileItem);
 }
 /** Cancel upload. Cancels request  */
 uploadUnsubscribe(): void {
  if (this.uploadSubscription) {
    this.uploadSubscription.unsubscribe();
   }
 }

}
