import { FilePickerService } from './file-picker.service';
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  TemplateRef,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { FilePreviewModel } from './file-preview.model';
import {getFileType} from './file-upload.utils';
import { FileValidationTypes, ValidationError } from './validation-error.model';
import { FilePickerAdapter } from './file-picker.adapter';
import { FileSystemFileEntry, UploadEvent, FileSystemDirectoryEntry } from './file-drop';
import { Subject, Observable, of, forkJoin, combineLatest} from 'rxjs';
import { takeUntil, tap, map, switchMap , mergeMap } from 'rxjs/operators';
import { DefaultCaptions } from './default-captions';
import { UploaderCaptions } from './uploader-captions';
declare var Cropper;
@Component({
  selector: 'ngx-file-picker',
  template: `
   <div (click)="fileInput.click()" class="file-drop-wrapper" *ngIf="showeDragDropZone">
      <file-drop
        (onFileDrop)="dropped($event)"
        [customstyle]="'custom-drag'"
        [captions]="_captions"
      >
      <ng-content select=".dropzoneTemplate"> </ng-content>
      </file-drop>
    </div>


    <input type="file" name="file[]" id="fileInput"
           #fileInput
           [multiple]="uploadType === 'multi' ? 'multiple' : '' "
           (click)="fileInput.value = null"
           (change)="onChange(fileInput)"
           [accept]="accept"
           class="file-input"
          >

    <div class="cropperJsOverlay" *ngIf="currentCropperFile">
     <div class="cropperJsBox">
     <img [src]="safeCropImgUrl" id="cropper-img" (load) = "cropperImgLoaded($event)">
        <div class="cropper-actions">
        <button class="cropSubmit" (click)="onCropSubmit()">{{_captions?.cropper?.crop}}</button>
        <button class="cropCancel" (click)="closeCropper({file: currentCropperFile, fileName: currentCropperFile.name})">
        {{_captions?.cropper?.cancel}}
        </button> </div>
      </div>
    </div>
    <div class="files-preview-wrapper" *ngIf="showPreviewContainer">
      <file-preview-container *ngIf="files"
      [previewFiles]="files"
      (removeFile)="removeFile($event)"
      (uploadSuccess)="onUploadSuccess($event)"
      [adapter]="adapter"
      [itemTemplate]="itemTemplate"
      [captions]="_captions"
      > </file-preview-container>
    </div>

  `,
  styleUrls: ['./file-picker.component.scss']
})
export class FilePickerComponent implements OnInit, OnDestroy {
  /** Emitted when file is uploaded via api successfully. Emitted for every file */
  @Output() uploadSuccess = new EventEmitter<FilePreviewModel>();
  /** Emitted when file is removed via api successfully. Emitted for every file */
  @Output() removeSuccess = new EventEmitter<FilePreviewModel>();
  /** Emitted on file validation fail */
  @Output() validationError = new EventEmitter<ValidationError>();
  /** Emitted when file is added and passed validations. Not uploaded yet */
  @Output() fileAdded = new EventEmitter<FilePreviewModel>();
  /** Custom validator function */
  @Input() customValidator: (file: File) => Observable<boolean>;
  /** Whether to enable cropper. Default: disabled */
  @Input()
   enableCropper = false;
  /** Whether to show default drag and drop zone. Default:true */
  @Input() showeDragDropZone = true;
   /** Whether to show default files preview container. Default: true */
  @Input() showPreviewContainer = true;
   /** Preview Item template */
  @Input() itemTemplate: TemplateRef<any>;
  /** Single or multiple. Default: multi */
  @Input()
   uploadType = 'multi';
  /** Max size of selected file in MB. Default: no limit */
  @Input()
   fileMaxSize: number;
  /** Max count of file in multi-upload. Default: no limit */
  @Input()
   fileMaxCount: number;
  /** Total Max size limit of all files in MB. Default: no limit */
  @Input()
   totalMaxSize: number;
  /** Which file types to show on choose file dialog. Default: show all */
  @Input()
  accept: string;
  files: FilePreviewModel[] = [];
 /** File extensions filter */
  @Input() fileExtensions: String;
  cropper: any;
  /** Cropper options. */
  @Input() cropperOptions: Object;
  /** Files array for cropper. Will be shown equentially if crop enabled */
  filesForCropper: File[] = [];
   /** Current file to be shown in cropper*/
   currentCropperFile: File;
  /** Custom api Adapter for uploading/removing files */
  @Input()
   adapter: FilePickerAdapter;
  /**  Custome template for dropzone */
   @Input() dropzoneTemplate: TemplateRef<any>;
  /** Custom captions input. Used for multi language support */
   @Input() captions: UploaderCaptions;
   /** captions object*/
   _captions: UploaderCaptions;
   cropClosed$ = new Subject<FilePreviewModel>();
   _onDestroy$ = new Subject<void>();
   safeCropImgUrl: SafeResourceUrl;
  constructor(private fileService: FilePickerService, private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.setCropperOptions();
    this.listenToCropClose();
    this.setCaptions();
  }
  ngOnDestroy() {
    this._onDestroy$.next();
  }
  setCaptions() {
  this._captions = this.captions || DefaultCaptions;
  }
  /** Listen when Cropper is closed and open new cropper if next image exists */
  listenToCropClose() {
    this.cropClosed$
    .pipe(takeUntil(this._onDestroy$))
    .subscribe((res: FilePreviewModel) => {
      const croppedIndex = this.filesForCropper.findIndex(item => item.name === res.fileName);
      const nextFile = croppedIndex !== -1 ? this.filesForCropper[croppedIndex + 1] : undefined;
     // console.log(nextFile)
  //  console.log('cropped', res);
      this.filesForCropper = [...this.filesForCropper].filter(item => item.name !== res.fileName);
     // console.log(this.filesForCropper);
      if (nextFile) {
         this.openCropper(nextFile);
      }
    });
  }
/** Sets custom cropper options if avaiable */
  setCropperOptions() {
    if (!this.cropperOptions) {
    this.setDefaultCropperOptions();
    }
  }
  /** Sets manual cropper options if no custom options are avaiable */
  setDefaultCropperOptions() {
    this.cropperOptions = {
      dragMode: 'crop',
      aspectRatio: 1,
      autoCrop: true,
      movable: true,
      zoomable: true,
      scalable: true,
      autoCropArea: 0.8
    };
  }
  /** On input file selected */
  onChange( fileInput: HTMLInputElement) {
     const files: File[] =  Array.from(fileInput.files);
    this.handleFiles(files).subscribe();
  }
  /** Handles input and drag/drop files */
   handleFiles(files: File[]): Observable<void> {
    if (!this.isValidMaxFileCount(files)) {return of(null); }
    const isValidUploadSync = files.every(item => this.validateFileSync(item));
    const asyncFunctions = files.map(item => this.validateFileAsync(item));
    return combineLatest(...asyncFunctions)
      .pipe(
        map(res => {
          const isValidUploadAsync = res.every(result => result === true);
          if (!isValidUploadSync || !isValidUploadAsync) {return; }
          files.forEach((file: File, index: number) => {
            this.handleInputFile(file, index );
          });
        })
      );
  }
  /** Validates synchronous validations */
  validateFileSync(file: File): boolean {
    if (!file) {return; }
    if (!this.isValidUploadType(file)) {return; }
    if (!this.isValidExtension(file, file.name)) {return; }
    return true;
  }
  /** Validates asynchronous validations */
  validateFileAsync(file: File): Observable<boolean> {
    if (!this.customValidator) {return of(true); }
    return this.customValidator(file).pipe(
      tap(res => {
        if (!res) { this.validationError.next({file: file, error: FileValidationTypes.customValidator}); }
      })
    );
  }
  /** Handles input and drag&drop files */
  handleInputFile(file: File, index): void {
    const type = getFileType(file.type);
    if (type === 'image' && this.enableCropper) {
      this.filesForCropper.push(file);
      if (!(this.currentCropperFile)) {
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
      this.validationError.next({file: file, error: FileValidationTypes.uploadType});
      return false;
    } else {
      return true;
    }
  }
  /** Validates max file count */
  isValidMaxFileCount(files: File[]): boolean {
    if (!this.fileMaxCount || this.fileMaxCount >= this.files.length + files.length ) {
      return true;
     } else {
       this.validationError.next({file: null, error: FileValidationTypes.fileMaxCount});
      return false;
     }
  }
  /** On file dropped */
  dropped(event: UploadEvent) {
    const files = event.files;
    const filesForUpload: File[] = [];
    for (const droppedFile of event.files) {
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
  /** Add file to file list after succesfull validation */
  pushFile( file: File, fileName = file.name): void {
      this.files.push({ file: file, fileName: fileName});
      this.fileAdded.next({ file: file, fileName: fileName});
  }
  /** Opens cropper for image crop */
  openCropper(file: File): void {
    if ((<any>window).UPLOADER_TEST_MODE || typeof Cropper !== 'undefined' ) {
      this.safeCropImgUrl = this.fileService.createSafeUrl(file);
      this.currentCropperFile = file;
    } else  {
      console.warn('please import cropperjs script and styles to use cropper feature or disable it by setting [enableCropper]="false"');
      return;
    }
  }
  getSafeUrl(file: File): SafeResourceUrl {
    return this.fileService.createSafeUrl(file);
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
    setTimeout(() => this.cropClosed$.next(filePreview), 200);
  }
/** Removes files from files list */
  removeFileFromList(fileName: string): void {
    this.files = this.files.filter(f =>  f.fileName !== fileName);
  }
  /** Emits event when file upload api returns success  */
  onUploadSuccess(fileItem: FilePreviewModel): void {
    this.uploadSuccess.next(fileItem);
  }
  /** Validates file extension */
  isValidExtension(file: File, fileName: string): boolean {
    if (!this.fileExtensions) {return true; }
    const extension = fileName.split('.').pop();
    if (this.fileExtensions && (!this.fileExtensions.includes(extension))) {
      this.validationError.next({file: file, error: FileValidationTypes.extensions});
      return false;
    }
       return true;
  }
   /** Validates selected file size and total file size */
  isValidSize(file: File, size: number): boolean {
    /** Validating selected file size */
    const res: number = this.bitsToMb(size.toString());
    let isValidFileSize: boolean;
    let isValidTotalFileSize: boolean;
    if  (!this.fileMaxSize || ( this.fileMaxSize && res < this.fileMaxSize)) {
      isValidFileSize = true;
    } else {
      this.validationError.next({file: file, error: FileValidationTypes.fileMaxSize});
    }
    /** Validating Total Files Size */
    const totalBits = this.files.map(f => f.file.size).reduce((acc, curr) => acc + curr, 0);
      if (!this.totalMaxSize || (this.totalMaxSize && this.bitsToMb(totalBits + file.size) < this.totalMaxSize)) {
         isValidTotalFileSize = true;
      } else {
        this.validationError.next({file: file, error: FileValidationTypes.totalMaxSize});
      }
      return !!isValidFileSize && isValidTotalFileSize;
  }
  bitsToMb(size): number {
    return parseFloat(size) / 1048576;
  }
  /** when crop button submitted */
  onCropSubmit(): void {
    this.cropper.getCroppedCanvas().toBlob(this.blobFallBack.bind(this), 'image/jpeg');
  }
  /** After crop submit */
  blobFallBack(blob: Blob): void {
    if (!blob) {return;}
    if (this.isValidSize(<File>blob, blob.size)) {
      this.pushFile(<File>blob, this.currentCropperFile.name);
    }
   this.closeCropper({file: blob as File, fileName: this.currentCropperFile.name});
  }
  removeFile(fileItem: FilePreviewModel): void {
    if (this.adapter) {
      this.adapter.removeFile(fileItem)
      .subscribe(res => {
        this.onRemoveSuccess(fileItem);
      });
     } else {
      console.warn('no adapter was provided');
     }
   }
    /** Emits event when file remove api returns success  */
  onRemoveSuccess(fileItem: FilePreviewModel): void {
    this.removeSuccess.next(fileItem);
    this.removeFileFromList(fileItem.fileName);
  }


}
