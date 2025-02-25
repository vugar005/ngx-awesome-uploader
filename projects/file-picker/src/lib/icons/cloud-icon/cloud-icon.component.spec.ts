/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudIconComponent } from './cloud-icon.component';

describe('CloudIconComponent', () => {
  let component: CloudIconComponent;
  let fixture: ComponentFixture<CloudIconComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ CloudIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
