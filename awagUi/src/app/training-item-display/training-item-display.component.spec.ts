import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingItemDisplayComponent } from './training-item-display.component';

describe('TrainingItemDisplayComponent', () => {
  let component: TrainingItemDisplayComponent;
  let fixture: ComponentFixture<TrainingItemDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingItemDisplayComponent]
    });
    fixture = TestBed.createComponent(TrainingItemDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
