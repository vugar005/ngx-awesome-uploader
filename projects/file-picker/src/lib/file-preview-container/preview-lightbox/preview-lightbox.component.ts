import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FilePreviewModel } from '../../file-preview.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'ngx-preview-lightbox',
  templateUrl: './preview-lightbox.component.html',
  styleUrls: ['./preview-lightbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewLightboxComponent implements OnInit {
  @Input() file: FilePreviewModel;
  @Output() readonly previewClose = new EventEmitter<void>();
  loaded: boolean;
  safeUrl: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer) {}

  public ngOnInit(): void {
    this.getSafeUrl(this.file.file);
  }

  public getSafeUrl(file: File | Blob): void {
    const url = window.URL.createObjectURL(file);
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  public onClose(): void {
    this.previewClose.next();
  }
}
