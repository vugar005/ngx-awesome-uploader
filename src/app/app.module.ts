import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DemoFilePickerComponent } from './demo-file-picker/demo-file-picker.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FilePickerModule } from 'projects/file-picker/src/public_api';

@NgModule({ declarations: [
        AppComponent,
        DemoFilePickerComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FilePickerModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
