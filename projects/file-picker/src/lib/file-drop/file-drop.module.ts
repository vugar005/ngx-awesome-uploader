import { CloudIconComponent } from './cloud-icon/cloud-icon.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {FileComponent} from './file-drop.component';

@NgModule({
  declarations: [
    FileComponent,
    CloudIconComponent
  ],
  exports: [FileComponent],
  imports: [CommonModule],
  providers: [],
  bootstrap: [FileComponent],
})
export class FileDropModule {}
