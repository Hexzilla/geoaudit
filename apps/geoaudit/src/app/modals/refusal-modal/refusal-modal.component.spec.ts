import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefusalModalComponent } from './refusal-modal.component';

describe('RefusalModalComponent', () => {
  let component: RefusalModalComponent;
  let fixture: ComponentFixture<RefusalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefusalModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefusalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
