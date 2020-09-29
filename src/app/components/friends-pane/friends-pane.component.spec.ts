import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsPaneComponent } from './friends-pane.component';

describe('FriendsPaneComponent', () => {
  let component: FriendsPaneComponent;
  let fixture: ComponentFixture<FriendsPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FriendsPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
