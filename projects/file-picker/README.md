
# NGX-AWESOME-UPLOADER


![alt-text](https://raw.githubusercontent.com/vugar005/ngx-awesome-uploader/master/angular-image.gif?raw=true)



[![npm](https://img.shields.io/npm/l/ngx-awesome-uploader.svg)]() [![NPM Downloads](https://img.shields.io/npm/dt/ngx-awesome-uploader.svg)](https://www.npmjs.com/package/ngx-awesome-uploader) [![npm demo](https://img.shields.io/badge/demo-online-ed1c46.svg)](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fsimple-demo%2Fsimple-demo.component.ts) [![npm](https://img.shields.io/twitter/follow/vugar005.svg?label=Follow)](https://twitter.com/vugar005) [![npm](https://img.shields.io/github/issues/vugar005/ngx-awesome-uploader.svg)](https://github.com/vugar005/ngx-awesome-uploader) [![npm](https://img.shields.io/github/last-commit/vugar005/ngx-awesome-uploader.svg)](https://github.com/vugar005/ngx-awesome-uploader) ![npm](https://img.shields.io/readthedocs/ngx-awesome-uploader.svg)





This is an Angular Library for uploading files. It supports: File Upload and Preview (additionally preview images with lightbox), validation, image cropper , drag and drop with multi language support.



Tested on Angular Angular 6+. Supports Server Side Rendering.
>**Breaking Changes:** [Check Changes](https://github.com/vugar005/ngx-awesome-uploader/blob/master/breaking-changes-v10.md) changes if you come from version < 10.


* [Install](#install)
* [Usage](#usage)
* [Configuration](#api)
* [File Validation](#file-validation)
* [Built-in validations](#built-in-validations)
* [Custom validation](#custom-validation)
* [Cropper](#cropper)
* [Custom template](#custom-template)
* [Multi Language](#multi-language)
* [Edit Mode](#edit-mode)
* [Bonus](#bonus)



## Quick-links

[Example Application](https://ngx-awesome-uploader.stackblitz.io/) or

[StackBlitzDemo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fsimple-demo%2Fsimple-demo.component.ts)

## Install



npm install ngx-awesome-uploader --save



##### Load the module for your app:



```typescript
import { FilePickerModule } from  'ngx-awesome-uploader';

@NgModule({
  imports: [
  ...
  FilePickerModule
  ]
  })

```

## Usage

In order to make library maximum compatible with apis you need to create and provide <b>
custom adapter </b> which implements upload and remove requests. That's because I have no idea how to get file id in upload response json :) .
So this libray exposes a FilePickerAdapter abstract class which you can import on your new class file definition:


``` import { FilePickerAdapter } from 'ngx-awesome-uploader';```



After importing it to your custom adapter implementation (EG: CustomAdapter.ts), you must implement those 2 methods which are abstract in the FilePickerAdapter base class which are:



```
public abstract uploadFile(fileItem: FilePreviewModel): Observable<UploadResponse>;

public abstract removeFile(fileItem: FilePreviewModel): Observable<any>;
```



You can check DEMO adapter [here](https://github.com/vugar005/ngx-awesome-uploader/tree/master/projects/file-picker/src/lib/mock-file-picker.adapter.ts)



#### Now you can use it in your template



```html
<ngx-awesome-uploader
[adapter]="adapter"
>
</ngx-awesome-uploader>

```



#### and in the Component:



```typescript
import { HttpClient } from  '@angular/common/http';
import { DemoFilePickerAdapter } from  './demo-file-picker.adapter';
import { Component} from  '@angular/core';

@Component({
selector: 'demo-file-picker',
templateUrl: './demo-file-picker.component.html',
styleUrls: ['./demo-file-picker.component.scss']
})

export  class DemoFilePickerComponent {
adapter = new  DemoFilePickerAdapter(this.http);
constructor(private http: HttpClient) { }
}

```

>**Note:** As you see you should provide http instance to adapter.

Still in Doubt? Check [Minimal Setup Demo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fsimple-demo%2Fsimple-demo.component.ts)



## API

```typescript

/** Whether to enable cropper. Default: disabled */
@Input() enableCropper = false;

/** Whether to show default drag and drop template. Default:true */
@Input() showeDragDropZone = true;

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

/** File extensions filter. Default: any exteion */
@Input() fileExtensions: String;

/** Cropper options if cropper enabled. Default:
dragMode: 'crop',
aspectRatio: 1,
autoCrop: true,
movable: true,
zoomable: true,
scalable: true,
autoCropArea: 0.8
*/
@Input() cropperOptions: Object;

/** Custom Adapter for uploading/removing files. Required */
@Input() adapter: FilePickerAdapter;

/** Custom template for dropzone. Optional */
@Input() dropzoneTemplate: TemplateRef<any>;

/** Custom Preview Item template. Optional */
@Input() itemTemplate: TemplateRef<any>;

/** Whether to show default files preview container. Default: true */
@Input() showPreviewContainer = true;

/** Custom validator function. Optional */
@Input() customValidator: (file: File) => Observable<boolean>;

/** Custom captions input. Used for multi language support */
@Input() captions: UploaderCaptions;

/** Whether to auto upload file on file choose or not. Default: true. You can get files list by accessing component files. */
@Input() enableAutoUpload = true;
```

## Output events



```typescript

/** Emitted when file upload via api success.
Emitted for every file */
@Output() uploadSuccess = new  EventEmitter<FilePreviewModel>();

/** Emitted when file upload via api fails.
Emitted for every file */
@Output() uploadFail = new  EventEmitter<HttpErrorResponse>();

/** Emitted when file is removed via api successfully.
Emitted for every file */
@Output() removeSuccess = new  EventEmitter<FilePreviewModel>();

/** Emitted on file validation fail */
@Output() validationError = new  EventEmitter<ValidationError>();

/** Emitted when file is added and passed validations. Not uploaded yet */
@Output() fileAdded = new  EventEmitter<FilePreviewModel>();

/** Emitted when file is removed from fileList */
@Output() fileRemoved = new  EventEmitter<FilePreviewModel>();
```



## File-Validation

### Built-in-validations

All validations are emitted through <b> ValidationError </b>event.

To listen to validation errors (in case you provided validations), validationError event is emitted. validationError event implements interface [ValidationError](https://github.com/vugar005/ngx-awesome-uploader/blob/master/projects/file-picker/src/lib/validation-error.model.ts)
and which emits failed file and error type.

Supported validations:

| **Validation Type**                | **Description**                                                                                                                                                                       | **Default** |
|----------------------------|---------------------------------------------------------------------------------------|----------------------------------------|
| fileMaxSize: number       | Max size of selected file in MB.   | No limit
| fileExtensions: String        |  Emitted when file does not satisfy provided extension   | Any extension
| uploadType: String      | Upload type. Values: 'single' and 'multi'.  |multi
| totalMaxSize: number       | Total Max size of files in MB. If cropper is enabled, the cropped image size is considered.| No limit
| fileMaxCount: number       | Limit total files to upload by count  | No limit


### Custom-validation

You can also provide your own custom validation along with built-in validations.

You custom validation takes `file: File` and returns `Observable<boolean>`;

So that means you can provide sync and async validations.



```
public myCustomValidator(file: File): Observable<boolean> {
  if (file.name.includes('panda')) {
   return of(true);
  }

  if (file.size > 50) {
   return this.http.get('url').pipe(map((res) => res === 'OK' ));
  }
  return of(false);
  }
```
and pass to Template:

```html
<ngx-awesome-uploader
[customValidator]="myCustomValidator"
>
</ngx-awesome-uploader>

```


Check [Demo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fadvanced-demo%2Fadvanced-demo.component.html)





## Cropper



Library uses cropperjs to crop images but you need import it to use it. Example: in index html



```html

<script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.4.3/cropper.min.js" async>  </script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.4.3/cropper.css"  />

```



>**Note**: To use cropper, you should set enableCropper to true. Look at API section above.

You can also provide your custom cropper options.



## Custom-Template

You can provide custom template to library.

I) To provide custom template for drag and drop zone, use content projection. Example:

```html
  <ngx-awesome-uploader
  [adapter]="adapter">

  <div class="dropzoneTemplate">
  	<button>Custom</button>
  </div>

</ngx-awesome-uploader>

````



>**Note:** The wrapper of your custom template must have a class **dropzoneTemplate**.



[Checkout Demo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fadvanced-demo%2Fadvanced-demo.component.html)



II) To use custom file preview template, pass your custom template as below:



```html

<ngx-awesome-uploader #uploader
  [adapter]="adapter"
  [itemTemplate]="itemTemplate"
>
</ngx-awesome-uploader>

<ng-template #itemTemplate let-fileItem="fileItem" let-uploadProgress="uploadProgress">

  <p>{{fileItem.file.size}}</p>

  <p>{{fileItem.fileName}}</p>

  <p *ngIf="uploadProgress < 100">{{uploadProgress}}%</p>

  <button (click)="uploader.removeFile(fileItem)">Remove</button>

</ng-template>

```

In custom template <b>uploadProgress</b> and <b>fileItem</b> (which implements [FilePrevieModel](https://github.com/vugar005/ngx-awesome-uploader/blob/master/projects/file-picker/src/lib/file-preview.model.ts) interface) are exposed .

## Multi Language

You can add multi language support for library by providing ***captions*** object (which implements [UploaderCaptions](https://github.com/vugar005/ngx-awesome-uploader/blob/master/projects/file-picker/src/lib/uploader-captions.ts) interface).



Check [Demo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fadvanced-demo%2Fadvanced-demo.component.html)

## Edit Mode

You can show your files without uploading them

```   @ViewChild('uploader', { static: true }) uploader: FilePickerComponent; ```

```
  public ngOnInit(): void {
    const files = [
      {
        fileName: 'My File 1 for edit.png'
      },
      {
        fileName: 'My File 2 for edit.xlsx'
      }
    ] as FilePreviewModel[];
    this.uploader.setFiles(files);
  }
```
## Bonus

You can also check out library [router animations ](https://www.npmjs.com/package/ngx-router-animations)

## Contribution



You can fork project from github. Pull requests are kindly accepted.

1. Building library: ng build file-picker --prod

2. Running tests: ng test file-picker  --browsers=ChromeHeadless

3. Run demo: ng serve