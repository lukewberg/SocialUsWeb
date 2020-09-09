import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostmakerComponent } from './postmaker.component';

describe('PostmakerComponent', () => {
  let component: PostmakerComponent;
  let fixture: ComponentFixture<PostmakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostmakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostmakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
