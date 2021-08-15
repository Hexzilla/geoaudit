import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbrioxComponent } from './abriox.component';

describe('AbrioxComponent', () => {
  let component: AbrioxComponent;
  let fixture: ComponentFixture<AbrioxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbrioxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbrioxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
