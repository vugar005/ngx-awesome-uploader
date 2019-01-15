import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
export function getFileType(fileExtension: string): string {
  if (fileExtension.includes('image')) {
    return 'image';
  } else if (fileExtension.includes('video')) {
    return 'video';
  } else {
    return 'other';
  }
}

