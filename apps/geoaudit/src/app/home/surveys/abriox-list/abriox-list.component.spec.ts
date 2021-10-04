import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbrioxListComponent } from './abriox-list.component';

describe('SurveyComponent', () => {
  let component: AbrioxListComponent;
  let fixture: ComponentFixture<AbrioxListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbrioxListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbrioxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
