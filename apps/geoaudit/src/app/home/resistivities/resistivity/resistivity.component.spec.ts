import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResistivityComponent } from './resistivity.component';

describe('TestpostComponent', () => {
  let component: ResistivityComponent;
  let fixture: ComponentFixture<ResistivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResistivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResistivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
