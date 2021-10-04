import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteActionItemComponent } from './site-action-item.component';

describe('SiteActionItemComponent', () => {
  let component: SiteActionItemComponent;
  let fixture: ComponentFixture<SiteActionItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteActionItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteActionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
