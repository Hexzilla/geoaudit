import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrActionComponent } from './tr-action.component';

describe('TestpostComponent', () => {
  let component: TrActionComponent;
  let fixture: ComponentFixture<TrActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
