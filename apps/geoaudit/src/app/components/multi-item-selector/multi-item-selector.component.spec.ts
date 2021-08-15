import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiItemSelectorComponent } from './multi-item-selector.component';

describe('MultiItemSelectorComponent', () => {
  let component: MultiItemSelectorComponent;
  let fixture: ComponentFixture<MultiItemSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiItemSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiItemSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
