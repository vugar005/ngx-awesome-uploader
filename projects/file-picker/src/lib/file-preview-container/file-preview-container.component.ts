import { Component, OnInit, Input, Output, EventEmitter, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { FilePreviewModel } from '../file-preview.model';
import { FilePickerAdapter } from '../file-picker.adapter';
import { UploaderCaptions } from '../uploader-captions';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'file-preview-container',
    templateUrl: './file-preview-container.component.html',
    styleUrls: ['./file-preview-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FilePreviewContainerComponent implements OnInit {
  @Input() previewFiles: FilePreviewModel[];
  @Input() itemTemplate: TemplateRef<any>;
  @Input() enableAutoUpload: boolean;
  @Output() public readonly removeFile = new EventEmitter<FilePreviewModel>();
  @Output() public readonly uploadSuccess = new EventEmitter<FilePreviewModel>();
  @Output() public readonly uploadFail = new EventEmitter<HttpErrorResponse>();
  public lightboxFile: FilePreviewModel;
  @Input() adapter: FilePickerAdapter;
  @Input() captions: UploaderCaptions;
  constructor(
  ) { }

  ngOnInit() {
  }

  public openLightbox(file: FilePreviewModel): void {
   this.lightboxFile = file;
  }

  public closeLightbox(): void {
    this.lightboxFile = undefined;
  }

}
