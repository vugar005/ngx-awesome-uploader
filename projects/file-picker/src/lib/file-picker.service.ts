import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable()
export class FilePickerService {
  constructor(private sanitizer: DomSanitizer) {}

  public mockUploadFile(formData): Observable<any> {
    console.log(formData);
    const event = new CustomEvent('customevent', {
      detail: {
        type: 'UploadProgreess',
      },
    });
    return of(event.detail);
  }

  // @ts-expect-error: Not all code paths return a value
  public createSafeUrl(file): SafeResourceUrl {
    try {
      const url = window.URL.createObjectURL(file);
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      return safeUrl;
    } catch (er) {
      console.log(er);
    }
  }
}
