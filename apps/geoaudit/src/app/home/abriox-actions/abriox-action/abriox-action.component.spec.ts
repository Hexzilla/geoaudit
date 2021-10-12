import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbrioxActionComponent } from './abriox-action.component';

describe('TestpostComponent', () => {
  let component: AbrioxActionComponent;
  let fixture: ComponentFixture<AbrioxActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbrioxActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbrioxActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
