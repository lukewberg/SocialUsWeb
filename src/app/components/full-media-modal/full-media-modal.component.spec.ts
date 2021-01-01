import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullMediaModalComponent } from './full-media-modal.component';

describe('FullMediaModalComponent', () => {
  let component: FullMediaModalComponent;
  let fixture: ComponentFixture<FullMediaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullMediaModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullMediaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
