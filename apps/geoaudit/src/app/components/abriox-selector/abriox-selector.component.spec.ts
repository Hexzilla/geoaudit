import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbrioxSelectorComponent } from './abriox-selector.component';

describe('AbrioxSelectorComponent', () => {
  let component: AbrioxSelectorComponent;
  let fixture: ComponentFixture<AbrioxSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbrioxSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbrioxSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
