import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Self,
  HostBinding,
  HostListener
} from '@angular/core';


import { UploaderCaptions } from '../uploader-captions';
import { FileDropService } from './ngx-dropzone.service';
import { coerceBooleanProperty, coerceNumberProperty } from './file-dop.utils';
import { UploadEvent } from './file-drop.models';


@Component({
  selector: 'file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss'],
  providers: [FileDropService]
})
export class FileComponent {

  constructor(
    @Self() private service: FileDropService
  ) { }

  @Input() captions: UploaderCaptions;
  @Input() customstyle: string;

  @Output() readonly onFileDrop = new EventEmitter<UploadEvent>();

  @Output()
  public onFileOver: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  public onFileLeave: EventEmitter<any> = new EventEmitter<any>();

  /** A template reference to the native file input element. */
  @ViewChild('fileInput', { static: true }) _fileInput: ElementRef;

  /** Set the accepted file types. Defaults to '*'. */
  @Input() accept = '*';

  /** Disable any user interaction with the component. */
  @Input()
  @HostBinding('class.ngx-dz-disabled')
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);

    if (this.isHovered) {
      this.isHovered = false;
    }
  }
  private _disabled = false;

  /** Allow the selection of multiple files. */
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    this._multiple = coerceBooleanProperty(value);
  }
  private _multiple = true;

  /** Set the maximum size a single file may have. */
  @Input()
  get maxFileSize(): number {
    return this._maxFileSize;
  }
  set maxFileSize(value: number) {
    this._maxFileSize = coerceNumberProperty(value);
  }
  private _maxFileSize: number = undefined;

  /** Allow the dropzone container to expand vertically. */
  @Input()
  @HostBinding('class.expandable')
  get expandable(): boolean {
    return this._expandable;
  }
  set expandable(value: boolean) {
    this._expandable = coerceBooleanProperty(value);
  }
  private _expandable: boolean = false;

  /** Open the file selector on click. */
  @Input()
  @HostBinding('class.unclickable')
  get disableClick(): boolean {
    return this._disableClick;
  }
  set disableClick(value: boolean) {
    this._disableClick = coerceBooleanProperty(value);
  }
  private _disableClick = false;

  /** Expose the id, aria-label, aria-labelledby and aria-describedby of the native file input for proper accessibility. */
  @Input() id: string;
  @Input('aria-label') ariaLabel: string;
  @Input('aria-labelledby') ariaLabelledby: string;
  @Input('aria-describedby') ariaDescribedBy: string;

  @HostBinding('class.ngx-dz-hovered') isHovered = false;

  /** Show the native OS file explorer to select files. */
  @HostListener('click')
  onClick() {
    if (!this.disableClick) {
      this.showFileSelector();
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event) {
    if (this.disabled) {
      return;
    }

    this.preventDefault(event);
    this.isHovered = true;
  }

  @HostListener('dragleave')
  onDragLeave() {
    this.isHovered = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event) {
    if (this.disabled) {
      return;
    }

    this.preventDefault(event);
    this.isHovered = false;
    this.handleFileDrop(event.dataTransfer.files);
  }

  private showFileSelector() {
    if (!this.disabled) {
      (this._fileInput.nativeElement as HTMLInputElement).click();
    }
  }

  public onFilesSelected(event) {
    const files: FileList = event.target.files;
    this.handleFileDrop(files);

    // Reset the native file input element to allow selecting the same file again
    this._fileInput.nativeElement.value = '';

    // fix(#32): Prevent the default event behaviour which caused the change event to emit twice.
    this.preventDefault(event);
  }

  private handleFileDrop(files: FileList): void {
    const result = this.service.parseFileList(files);
    this.onFileDrop.next({
      files: result.addedFiles
    });
  }

  private preventDefault(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}



