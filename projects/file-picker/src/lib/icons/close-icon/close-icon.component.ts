import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngx-close-icon',
  templateUrl: './close-icon.component.html',
  styleUrls: ['./close-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseIconComponent {}
