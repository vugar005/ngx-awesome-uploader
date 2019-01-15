import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FilePreviewModel } from '../file-preview.model';
import { FilePickerAdapter } from '../file-picker.adapter';

@Component({
  selector: 'file-preview-container',
  templateUrl: './file-preview-container.component.html',
  styleUrls: ['./file-preview-container.component.scss']
})
export class FilePreviewContainerComponent implements OnInit {
  @Input() previewFiles: FilePreviewModel[];
  @Output() public removeSuccess = new EventEmitter<FilePreviewModel>();
  @Output() public uploadSuccess = new EventEmitter<FilePreviewModel>();
  lightboxFile: FilePreviewModel;
  @Input() adapter: FilePickerAdapter;
  constructor() { }

  ngOnInit() {
  }
  openLightbox(file: FilePreviewModel) {
   this.lightboxFile = file;
  }
  closeLightbox() {
    this.lightboxFile = undefined;
  }

}
