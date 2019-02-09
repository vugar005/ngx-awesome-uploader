import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoFilePickerComponent } from './demo-file-picker/demo-file-picker.component';
import { FilePickerModule } from 'projects/file-picker/src/public_api';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    DemoFilePickerComponent
  ],
  imports: [
    BrowserModule,
    FilePickerModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
