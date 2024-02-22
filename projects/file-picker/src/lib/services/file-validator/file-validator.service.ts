import { Injectable } from '@angular/core';
import { bitsToMB } from '../../file-picker.constants';
import { FilePreviewModel } from '../../file-preview.model';

@Injectable({
  providedIn: 'root',
})
export class FileValidatorService {
  /** Validates file extension */
  public isValidExtension(fileName: string, fileExtensions: string[]): boolean {
    if (!fileExtensions?.length) {
      return true;
    }

    const extension: string = fileName.split('.').pop();
    const fileExtensionsLowercase = fileExtensions.map((ext) => ext.toLowerCase());
    if (fileExtensionsLowercase.indexOf(extension.toLowerCase()) === -1) {
      return false;
    }
    return true;
  }

  /** Validates if upload type is single so another file cannot be added */
  public isValidUploadType(files: FilePreviewModel[], uploadType: string): boolean {
    if (uploadType === 'single' && files?.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  /** Validates max file count */
  public isValidMaxFileCount(fileMaxCount: number, newFiles: File[], files: FilePreviewModel[]): boolean {
    if (!fileMaxCount || fileMaxCount >= files?.length + newFiles?.length) {
      return true;
    } else {
      return false;
    }
  }

  public isValidFileSize(size: number, fileMaxSize: number): boolean {
    const fileMB: number = bitsToMB(size);
    if (!fileMaxSize || (fileMaxSize && fileMB < fileMaxSize)) {
      return true;
    } else {
      return false;
    }
  }

  public isValidTotalFileSize(newFile: File, files: FilePreviewModel[], totalMaxSize: number): boolean {
    /** Validating Total Files Size */
    const totalBits = files.map((f) => (f.file ? f.file.size : 0)).reduce((acc, curr) => acc + curr, 0);

    if (!totalMaxSize || (totalMaxSize && bitsToMB(totalBits + newFile.size) < totalMaxSize)) {
      return true;
    } else {
      return false;
    }
  }
}
