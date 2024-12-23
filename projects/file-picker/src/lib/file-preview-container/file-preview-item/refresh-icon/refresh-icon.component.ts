import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'refresh-icon',
    templateUrl: './refresh-icon.component.html',
    styleUrls: ['./refresh-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class RefreshIconComponent {

}
