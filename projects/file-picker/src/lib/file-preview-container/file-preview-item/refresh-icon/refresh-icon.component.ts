import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngx-refresh-icon',
  templateUrl: './refresh-icon.component.html',
  styleUrls: ['./refresh-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefreshIconComponent {}
