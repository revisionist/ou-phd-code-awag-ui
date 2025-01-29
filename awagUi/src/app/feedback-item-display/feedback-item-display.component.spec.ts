import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackItemDisplayComponent } from './feedback-item-display.component';

describe('FeedbackItemDisplayComponent', () => {
  let component: FeedbackItemDisplayComponent;
  let fixture: ComponentFixture<FeedbackItemDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackItemDisplayComponent]
    });
    fixture = TestBed.createComponent(FeedbackItemDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
