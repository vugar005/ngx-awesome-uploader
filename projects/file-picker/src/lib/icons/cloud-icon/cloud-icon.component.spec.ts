/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CloudIconComponent } from './cloud-icon.component';

describe('CloudIconComponent', () => {
  let component: CloudIconComponent;
  let fixture: ComponentFixture<CloudIconComponent>;

  beforeEach(async(() => {
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
