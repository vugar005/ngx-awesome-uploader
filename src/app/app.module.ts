import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DemoFilePickerComponent } from './demo-file-picker/demo-file-picker.component';
import { HttpClientModule } from '@angular/common/http';
import { FilePickerModule } from 'projects/file-picker/src/public_api';

@NgModule({
  declarations: [AppComponent, DemoFilePickerComponent],
  imports: [BrowserModule, FilePickerModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
