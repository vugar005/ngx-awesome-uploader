import { FilePickerService } from './file-picker.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { FilePreviewModel } from './file-preview.model';
import { GET_FILE_CATEGORY_TYPE } from './file-upload.utils';
import { FileValidationTypes, ValidationError } from './validation-error.model';
import { FilePickerAdapter } from './file-picker.adapter';
import {
  FileSystemDirectoryEntry,
  FileSystemFileEntry,
  UploadEvent
} from './file-drop';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { DefaultCaptions } from './default-captions';
import { UploaderCaptions } from './uploader-captions';
import { HttpErrorResponse } from '@angular/common/http';
import { DEFAULT_CROPPER_OPTIONS, BITS_TO_MB } from './file-picker.constants';

declare var Cropper;
@Component({
  selector: 'ngx-awesome-uploader',
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilePickerComponent implements OnInit, OnDestroy {
  /** Emitted when file upload via api successfully. Emitted for every file */
  @Output() readonly uploadSuccess = new EventEmitter<FilePreviewModel>();
  /** Emitted when file upload via api failed. Emitted for every file */
  @Output() readonly uploadFail = new EventEmitter<HttpErrorResponse>();
  /** Emitted when file is removed via api successfully. Emitted for every file */
  @Output() readonly removeSuccess = new EventEmitter<FilePreviewModel>();
  /** Emitted on file validation fail */
  @Output() readonly validationError = new EventEmitter<ValidationError>();
  /** Emitted when file is added and passed validations. Not uploaded yet */
  @Output() readonly fileAdded = new EventEmitter<FilePreviewModel>();
  /** Emitted when file is removed from fileList */
  @Output() readonly fileRemoved = new EventEmitter<FilePreviewModel>();
  /** Custom validator function */
  @Input() customValidator: (file: File) => Observable<boolean>;
  /** Whether to enable cropper. Default: disabled */
  @Input() enableCropper = false;
  /** Whether to show default drag and drop zone. Default:true */
  @Input() showeDragDropZone = true;
  /** Whether to show default files preview container. Default: true */
  @Input() showPreviewContainer = true;
  /** Preview Item template */
  @Input() itemTemplate: TemplateRef<any>;
  /** Single or multiple. Default: multi */
  @Input() uploadType = 'multi';
  /** Max size of selected file in MB. Default: no limit */
  @Input() fileMaxSize: number;
  /** Max count of file in multi-upload. Default: no limit */
  @Input() fileMaxCount: number;
  /** Total Max size limit of all files in MB. Default: no limit */
  @Input() totalMaxSize: number;
  /** Which file types to show on choose file dialog. Default: show all */
  @Input() accept: string;
  /** File extensions filter */
  @Input() fileExtensions: string[];
  /** Cropper options. */
  @Input() cropperOptions: object;
  /** Cropped canvas options. */
  @Input() croppedCanvasOptions: object = {};
  /** Custom api Adapter for uploading/removing files */
  @Input() adapter: FilePickerAdapter;
  /**  Custome template for dropzone */
  @Input() dropzoneTemplate: TemplateRef<any>;
  /** Custom captions input. Used for multi language support */
  @Input() captions: UploaderCaptions = DefaultCaptions;
  /** captions object */
  /** Whether to auto upload file on file choose or not. Default: true */
  @Input() enableAutoUpload = true;
  cropper: any;
  public files: FilePreviewModel[] = [];
  /** Files array for cropper. Will be shown equentially if crop enabled */
  filesForCropper: File[] = [];
  /** Current file to be shown in cropper */
  public currentCropperFile: File;
  public safeCropImgUrl: SafeResourceUrl;
  private _cropClosed$ = new Subject<FilePreviewModel>();
  private _onDestroy$ = new Subject<void>();
  constructor(
    private fileService: FilePickerService,
    private changeRef: ChangeDetectorRef
  ) {}

  public ngOnInit() {
    this._setCropperOptions();
    this._listenToCropClose();
  }
  public ngOnDestroy() {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }
  /** On input file selected */
  public onChange(event: File[]) {
    const files: File[] = Array.from(event);
    this.handleFiles(files).subscribe();
  }

  /** On file dropped */
  public dropped(event: UploadEvent) {
    const files = event.files;
    const filesForUpload: File[] = [];
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          filesForUpload.push(file);
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        // console.log(droppedFile.relativePath, fileEntry);
      }
    }
    setTimeout(() => this.handleFiles(filesForUpload).subscribe());
  }

  /** Emits event when file upload api returns success  */
  public onUploadSuccess(fileItem: FilePreviewModel): void {
    this.uploadSuccess.next(fileItem);
  }

  /** Emits event when file upload api returns success  */
  public onUploadFail(er: HttpErrorResponse): void {
    this.uploadFail.next(er);
  }

  /** Emits event when file remove api returns success  */
  public onRemoveSuccess(fileItem: FilePreviewModel): void {
    this.removeSuccess.next(fileItem);
    this.removeFileFromList(fileItem);
  }

  public getSafeUrl(file: File): SafeResourceUrl {
    return this.fileService.createSafeUrl(file);
  }

  /** Removes file from UI and sends api */
  public removeFile(fileItem: FilePreviewModel): void {
    if (!this.enableAutoUpload) {
      this.removeFileFromList(fileItem);
      return;
    }
    if (this.adapter) {
      this.adapter.removeFile(fileItem).subscribe(res => {
        this.onRemoveSuccess(fileItem);
      });
    } else {
      console.warn('no adapter was provided');
    }
  }

  /** Listen when Cropper is closed and open new cropper if next image exists */
  private _listenToCropClose() {
    this._cropClosed$
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((res: FilePreviewModel) => {
        const croppedIndex = this.filesForCropper.findIndex(
          item => item.name === res.fileName
        );
        const nextFile =
          croppedIndex !== -1
            ? this.filesForCropper[croppedIndex + 1]
            : undefined;
        this.filesForCropper = [...this.filesForCropper].filter(
          item => item.name !== res.fileName
        );
        if (nextFile) {
          this.openCropper(nextFile);
        }
      });
  }
  /** Sets custom cropper options if avaiable */
  private _setCropperOptions() {
    if (!this.cropperOptions) {
      this._setDefaultCropperOptions();
    }
  }
  /** Sets manual cropper options if no custom options are avaiable */
  private _setDefaultCropperOptions() {
    this.cropperOptions = DEFAULT_CROPPER_OPTIONS;
  }

  /** Handles input and drag/drop files */
  handleFiles(files: File[]): Observable<void> {
    if (!this.isValidMaxFileCount(files)) {
      return of(null);
    }
    const isValidUploadSync = files.every(item => this._validateFileSync(item));
    const asyncFunctions = files.map(item => this._validateFileAsync(item));
    return combineLatest([...asyncFunctions]).pipe(
      map(res => {
        const isValidUploadAsync = res.every(result => result === true);
        if (!isValidUploadSync || !isValidUploadAsync) {
          return;
        }
        files.forEach((file: File, index: number) => {
          this.handleInputFile(file, index);
        });
      })
    );
  }
  /** Validates synchronous validations */
  private _validateFileSync(file: File): boolean {
    if (!file) {
      return;
    }
    if (!this.isValidUploadType(file)) {
      return;
    }
    if (!this.isValidExtension(file, file.name)) {
      return;
    }
    return true;
  }

  /** Validates asynchronous validations */
  private _validateFileAsync(file: File): Observable<boolean> {
    if (!this.customValidator) {
      return of(true);
    }
    return this.customValidator(file).pipe(
      tap(res => {
        if (!res) {
          this.validationError.next({
            file,
            error: FileValidationTypes.customValidator
          });
        }
      })
    );
  }

  /** Handles input and drag&drop files */
  handleInputFile(file: File, index): void {
    const type = GET_FILE_CATEGORY_TYPE(file.type);
    if (type === 'image' && this.enableCropper) {
      this.filesForCropper.push(file);
      if (!this.currentCropperFile) {
        this.openCropper(file);
      }
    } else {
      /** Size is not initially checked on handleInputFiles because of cropper size change */
      if (this.isValidSize(file, file.size)) {
        this.pushFile(file);
      }
    }
  }

  /** Validates if upload type is single so another file cannot be added */
  isValidUploadType(file): boolean {
    if (this.uploadType === 'single' && this.files.length > 0) {
      this.validationError.next({
        file,
        error: FileValidationTypes.uploadType
      });
      return false;
    } else {
      return true;
    }
  }

  /** Validates max file count */
  isValidMaxFileCount(files: File[]): boolean {
    if (!this.fileMaxCount || this.fileMaxCount >= this.files.length + files.length
    ) {
      return true;
    } else {
      this.validationError.next({
        file: null,
        error: FileValidationTypes.fileMaxCount
      });
      return false;
    }
  }

  /** Add file to file list after succesfull validation */
  pushFile(file: File, fileName = file.name): void {
    const newFile = { file, fileName };
    const files = [...this.files, newFile];
    this.setFiles(files);
    this.fileAdded.next({ file, fileName });
    this.changeRef.detectChanges();
  }

  public setFiles(files: FilePreviewModel[]): void {
    this.files = files;
    this.changeRef.detectChanges();
  }
  /** Opens cropper for image crop */
  openCropper(file: File): void {
    if ((window as any).CROPPER  || typeof Cropper !== 'undefined') {
      this.safeCropImgUrl = this.fileService.createSafeUrl(file);
      this.currentCropperFile = file;
      this.changeRef.detectChanges();
    } else {
      console.warn(
        "please import cropperjs script and styles to use cropper feature or disable it by setting [enableCropper]='false'"
      );
      return;
    }
  }

  /** On img load event */
  cropperImgLoaded(e): void {
    const image = document.getElementById('cropper-img');
    this.cropper = new Cropper(image, this.cropperOptions);
  }
  /** Close or cancel cropper */
  closeCropper(filePreview: FilePreviewModel): void {
    this.currentCropperFile = undefined;
    this.cropper = undefined;
    this.changeRef.detectChanges();
    setTimeout(() => this._cropClosed$.next(filePreview), 200);
  }

  /** Removes files from files list */
  removeFileFromList(file: FilePreviewModel): void {
    const files = this.files.filter(f => f.fileName !== file.fileName);
    this.setFiles(files);
    this.fileRemoved.next(file);
    this.changeRef.detectChanges();
  }

  /** Validates file extension */
  isValidExtension(file: File, fileName: string): boolean {
    if (!this.fileExtensions) {return true; }
    const extension = fileName.split('.').pop();
    const fileExtensions = this.fileExtensions.map(ext => ext.toLowerCase());
    if (fileExtensions.indexOf(extension.toLowerCase()) === -1) {
      this.validationError.next({file, error: FileValidationTypes.extensions});
      return false;
    }
    return true;
  }
  /** Validates selected file size and total file size */
  isValidSize(file: File, size: number): boolean {
    /** Validating selected file size */
    const res: number = BITS_TO_MB(size);
    let isValidFileSize: boolean;
    let isValidTotalFileSize: boolean;
    if (!this.fileMaxSize || (this.fileMaxSize && res < this.fileMaxSize)) {
      isValidFileSize = true;
    } else {
      this.validationError.next({
        file,
        error: FileValidationTypes.fileMaxSize
      });
    }
    /** Validating Total Files Size */
    const totalBits = this.files
      .map(f => f.file ? f.file.size : 0)
      .reduce((acc, curr) => acc + curr, 0);
    if (
      !this.totalMaxSize ||
      (this.totalMaxSize &&
        BITS_TO_MB(totalBits + file.size) < this.totalMaxSize)
    ) {
      isValidTotalFileSize = true;
    } else {
      this.validationError.next({
        file,
        error: FileValidationTypes.totalMaxSize
      });
    }
    return !!isValidFileSize && isValidTotalFileSize;
  }

  /** when crop button submitted */
  onCropSubmit(): void {
    this.cropper
      .getCroppedCanvas(this.croppedCanvasOptions)
      .toBlob(this._blobFallBack.bind(this), 'image/png');
  }
  /** After crop submit */
  private _blobFallBack(blob: Blob): void {
    if (!blob) {
      return;
    }
    if (this.isValidSize(blob as File, blob.size)) {
      this.pushFile(blob as File, this.currentCropperFile.name);
    }
    this.closeCropper({
      file: blob as File,
      fileName: this.currentCropperFile.name
    });
  }

}
