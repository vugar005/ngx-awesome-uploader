import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'close-icon',
  templateUrl: './close-icon.component.html',
  styleUrls: ['./close-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloseIconComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
