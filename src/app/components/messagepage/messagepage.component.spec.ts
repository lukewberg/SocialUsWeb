import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagepageComponent } from './messagepage.component';

describe('MessagepageComponent', () => {
  let component: MessagepageComponent;
  let fixture: ComponentFixture<MessagepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessagepageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
