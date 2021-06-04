import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyTableComponent } from './survey-table.component';

describe('SurveyTableComponent', () => {
  let component: SurveyTableComponent;
  let fixture: ComponentFixture<SurveyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
