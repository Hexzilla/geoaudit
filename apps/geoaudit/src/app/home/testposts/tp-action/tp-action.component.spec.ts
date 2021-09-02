import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpActionComponent } from './tp-action.component';

describe('TestpostComponent', () => {
  let component: TpActionComponent;
  let fixture: ComponentFixture<TpActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TpActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TpActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
