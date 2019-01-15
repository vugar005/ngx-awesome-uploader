import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FilePreviewModel } from '../../file-preview.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'preview-lightbox',
  templateUrl: './preview-lightbox.component.html',
  styleUrls: ['./preview-lightbox.component.scss']
})
export class PreviewLightboxComponent implements OnInit {
  @Input() file: FilePreviewModel;
  @Output() close = new EventEmitter<void>();
  loaded: boolean;
  safeUrl: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.getSafeUrl(this.file.file);
  }
  getSafeUrl(file: File | Blob): void {
    const url = window.URL.createObjectURL(file);
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  onClose(event): void {
   this.close.next();
  }

}
