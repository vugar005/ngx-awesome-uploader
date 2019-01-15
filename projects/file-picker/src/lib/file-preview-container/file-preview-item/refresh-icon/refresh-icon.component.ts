import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'refresh-icon',
  templateUrl: './refresh-icon.component.html',
  styleUrls: ['./refresh-icon.component.scss']
})
export class RefreshIconComponent implements OnInit {
   @Output() public retry  = new EventEmitter<void>();
  constructor() { }

  ngOnInit() {
  }

}
