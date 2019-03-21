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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var Cropper;
@Component({
  selector: 'ngx-file-picker',
  template: `
   <div (click)="fileInput.click()" class="file-drop-wrapper" *ngIf="showeDragDropZone">
      <file-drop
        (onFileDrop)="dropped($event)"
        [customstyle]="'custom-drag'"
        [headertext]="'Drag and drop file here'"
      >
      <ng-content select=".dropzoneTemplate"> </ng-content>
      </file-drop>
    </div>


    <input type="file" name="file[]" id="fileInput"
           #fileInput
           [multiple]="uploadType === 'multi' ? 'multiple' : '' "
           (click)="fileInput.value = null"
           (change)="onChange(fileInput)"
           class="file-input"
          >

    <div class="cropperJsOverlay" *ngIf="currentCropperFile">
     <div class="cropperJsBox">
     <img [src]="safeCropImgUrl" id="cropper-img" (load) = "cropperImgLoaded($event)">
        <div class="cropper-actions">
        <button class="cropSubmit" (click)="onCropSubmit()">Crop</button>
        <button class="cropCancel" (click)="closeCropper({file: currentCropperFile, fileName: currentCropperFile.name})">Cancel</button> </div>
      </div>
    </div>
    <div class="files-preview-wrapper" *ngIf="showPreviewContainer">
      <file-preview-container *ngIf="files"
      [previewFiles]="files"
      (removeFile)="removeFile($event)"
      (uploadSuccess)="onUploadSuccess($event)"
      [adapter]="adapter"
      [itemTemplate]="itemTemplate"
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
  /** Custom Adapter for uploading/removing files */
  @Input()
   adapter: FilePickerAdapter;
  /**  Custome template for dropzone */
   @Input() dropzoneTemplate: TemplateRef<any>;
   cropClosed$ = new Subject<FilePreviewModel>();
   _onDestroy$ = new Subject<void>();
   safeCropImgUrl: SafeResourceUrl;
  constructor(private fileService: FilePickerService, private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.setCropperOptions();
    this.listenToCropClose();
  }
  ngOnDestroy() {
    this._onDestroy$.next();
  }
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

  setCropperOptions() {
    if (!this.cropperOptions) {
    this.setDefaultCropperOptions();
    }
  }
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
    this.handleFiles(files);
  }
  handleFiles(files: File[]) {
    if (!this.isValidMaxFileCount(files)) {return; }
    const isValidUpload = files.every(item => this.validateFile(item));
    if (!isValidUpload) {return; }
//    console.log(files)
    files.forEach((file: File, index: number) => {
      this.handleInputFile(file, index );
    });
  }
  validateFile(file: File): boolean {
    if (!file) {return; }
    if (!this.isValidUploadType(file)) {return; }
    if (!this.isValidExtension(file, file.name)) {return; }
    return true;
  }
  handleInputFile(file: File, index): void {
    const type = getFileType(file.type);
    if (type === 'image' && this.enableCropper) {
      this.filesForCropper.push(file);
      if (!(this.currentCropperFile)) {
        this.openCropper(file);
      }
    } else {
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
     //    this.handleInputFile(file);
          filesForUpload.push(file);
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
       // console.log(droppedFile.relativePath, fileEntry);
      }
    }
    setTimeout(() => this.handleFiles(filesForUpload));
  }
  /** Add file to file list after succesfull validation */
  pushFile( file: File, fileName = file.name): void {
      this.files.push({ file: file, fileName: fileName});
      this.fileAdded.next({ file: file, fileName: fileName});
  }
  openCropper(file: File): void {
    if (typeof Cropper === 'undefined') {
      console.warn('please import cropperjs script and styles to use cropper feature or disable it by setting [enableCropper]="false"');
      return;
    }
    this.safeCropImgUrl = this.fileService.createSafeUrl(file);
    this.currentCropperFile = file;
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
  blobFallBack(blob: Blob): void {
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
