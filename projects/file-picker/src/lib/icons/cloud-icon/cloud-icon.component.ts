import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'cloud-icon',
    templateUrl: './cloud-icon.component.html',
    styleUrls: ['./cloud-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CloudIconComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
