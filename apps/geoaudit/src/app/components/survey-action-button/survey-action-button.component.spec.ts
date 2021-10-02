import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyActionButtonComponent } from './survey-action-button.component';

describe('SurveyActionButtonComponent', () => {
  let component: SurveyActionButtonComponent;
  let fixture: ComponentFixture<SurveyActionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyActionButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
