import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleItemSelectorComponent } from './single-item-selector.component';

describe('SingleItemSelectorComponent', () => {
  let component: SingleItemSelectorComponent;
  let fixture: ComponentFixture<SingleItemSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleItemSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleItemSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
