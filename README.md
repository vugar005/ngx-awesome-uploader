




# NGX-AWESOME-UPLOADER

<p align="center">
<img  src="https://i.gifer.com/MJQT.gif">
<p>

[![npm](https://img.shields.io/npm/l/ngx-awesome-uploader.svg)]() [![NPM Downloads](https://img.shields.io/npm/dt/ngx-awesome-uploader.svg)](https://www.npmjs.com/package/ngx-awesome-uploader) [![npm](https://img.shields.io/twitter/follow/vugar005.svg?label=Follow)](https://twitter.com/vugar005) [![npm](https://img.shields.io/github/issues/vugar005/ngx-awesome-uploader.svg)](https://github.com/vugar005/ngx-awesome-uploader) [![npm](https://img.shields.io/github/last-commit/vugar005/ngx-awesome-uploader.svg)](https://github.com/vugar005/ngx-awesome-uploader) ![npm](https://img.shields.io/readthedocs/ngx-awesome-uploader.svg)



This is an Angular Library for uploading files. It supports: File Upload and Preview (additionally preview images with lightbox), validation, image cropper , drag and drop with multi language support.

Tested on Angular 6/7/8. Supports Server Side Rendering.

* [Install](#install)
* [Usage](#usage)
* [Configuration](#api)
* [File Validation](#file-validation)
		* [Built-in validations](#built-in-validations)
		* [Custom validation](#custom-validation)
* [Cropper](#cropper)
* [Custom template](#custom-template)
* [Multi Language](#multi-language)
* [Bonus](#bonus)

## Quick-links
[Example Application](https://ngx-awesome-uploader.stackblitz.io/)
[StackBlitzDemo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fsimple-demo%2Fsimple-demo.component.ts)
## Install

    npm install ngx-awesome-uploader --save

##### Load the module for your app:

```typescript
import { FilePickerModule } from  'ngx-awesome-uploader';
@NgModule({
imports:  [
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
public abstract uploadFile(fileItem: FilePreviewModel): Observable<number | string>;

public abstract removeFile(fileItem: FilePreviewModel): Observable<any>;
```

>**Note:** Since uploadFile method will use http progress event, it has to return **id** of file (***in string type only***) in  case of HttpEventType.Response type, or progress (***in number type***) in case of HttpEventType.UploadProgress. You will receive this id on removeFile method when you click remove.

You can check DEMO adapter [here](https://github.com/vugar005/ngx-awesome-uploader/tree/master/projects/file-picker/src/lib/mock-file-picker.adapter.ts)

#### Now you can use it in your template

```html
<ngx-file-picker
[adapter]="adapter"
>
</ngx-file-picker>
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
export class DemoFilePickerComponent {
adapter = new DemoFilePickerAdapter(this.http);
constructor(private  http: HttpClient) { }
}
```
>**Note:** As you see you should provide http instance to adapter.
Still in Doubt? Check [Minimal Setup Demo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fsimple-demo%2Fsimple-demo.component.ts)

## api
```typescript
/** Whether to enable cropper. Default: disabled */
@Input() enableCropper =  false;

/** Whether to show default drag and drop template. Default:true */
@Input() showeDragDropZone =  true;

/** Single or multiple. Default: multi */
@Input() uploadType =  'multi';

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
@Input() showPreviewContainer =  true;

/** Custom validator function. Optional */
@Input() customValidator: (file: File) => Observable<boolean>;
  /** Custom captions input. Used for multi language support */
@Input() captions: UploaderCaptions;
```
## Output events

```typescript
/** Emitted when file is uploaded via api successfully.
Emitted for every file */
@Output() uploadSuccess =  new  EventEmitter<FilePreviewModel>();
/** Emitted when file is removed via api successfully.
	Emitted for every file */
@Output() removeSuccess =  new  EventEmitter<FilePreviewModel>();
/** Emitted on file validation fail */
@Output() validationError =  new  EventEmitter<ValidationError>();
/** Emitted when file is added and passed validations. Not uploaded yet */
@Output() fileAdded =  new  EventEmitter<FilePreviewModel>();
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

        myCustomValidator(file: File): Observable<boolean>  {
	    	if (file.name.includes('panda')) {
    		    return  of(true);
    	      }
		    if (file.size  >  50) {
    			return  this.http.get('url').pipe(map((res) => res ===  'OK' ));
		    }
    	    return  of(false);
        }
and pass to Template:
```html
<ngx-file-picker
[customValidator]="myCustomValidator"
>
</ngx-file-picker>
```

Check [Demo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fadvanced-demo%2Fadvanced-demo.component.html)



## Cropper

Library uses cropperjs to crop images but you need import it to use it. Example: in index html

```html
<script  src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.4.3/cropper.min.js"  async>  </script>
<link  rel="stylesheet"  href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.4.3/cropper.css"  />
```

>**Note**: To use cropper, you should set enableCropper to true. Look at API section above.
You can also provide your custom cropper options.

## Custom-Template

You can provide custom template to library.

I) To provide custom template for drag and drop zone, use content projection. Example:

```html
<ngx-file-picker
[adapter]="adapter">

	<div  class="dropzoneTemplate">
		<button>Custom</button>
	</div>

</ngx-file-picker>
````

>**Note:**  The wrapper of your custom template must have a class **dropzoneTemplate**.

[Checkout Demo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fadvanced-demo%2Fadvanced-demo.component.html)

II) To use custom file preview template, pass your custom template as below:

```html
<ngx-file-picker  #uploader
	[adapter]="adapter"
	[itemTemplate]="itemTemplate"
>
</ngx-file-picker>

<ng-template  #itemTemplate  let-fileItem="fileItem">
	<p>{{fileItem.file.size}}</p>
	<p>{{fileItem.fileName}}</p>
	<button  (click)="uploader.removeFile(fileItem)">Remove</button>
</ng-template>
```
In custom template <b>fileItem</b> is exposed (which implements [FilePrevieModel](https://github.com/vugar005/ngx-awesome-uploader/blob/master/projects/file-picker/src/lib/file-preview.model.ts) interface).
## Multi Language
You can add multi language support for library by providing ***captions*** object (which implements [UploaderCaptions](https://github.com/vugar005/ngx-awesome-uploader/blob/master/projects/file-picker/src/lib/uploader-captions.ts) interface).

Check [Demo](https://stackblitz.com/edit/ngx-awesome-uploader?file=src%2Fapp%2Fadvanced-demo%2Fadvanced-demo.component.html)

## Bonus
You can also check out library [router animations ](https://www.npmjs.com/package/ngx-router-animations)
## Contribution

You can fork project from github. Pull requests are kindly accepted.
1. Building library: ng build file-picker
2. Running tests: ng test file-picker
3. Run demo: ng serve