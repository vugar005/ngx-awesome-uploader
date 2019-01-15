import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable()
export class FilePickerService {
  constructor(private sanitizer: DomSanitizer) { }
  mockUploadFile(formData): Observable<any> {
    const event = new CustomEvent('customevent', {
      detail: {
        type: 'UploadProgreess'
      }
    });
    return of (event.detail);
  }
  createSafeUrl(file): SafeResourceUrl {
    try {
      const url = window.URL.createObjectURL(file);
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    return safeUrl;

    } catch (er) {
      console.log(er);
    }
  }
}
