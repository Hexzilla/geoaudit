import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestpostComponent } from './testpost.component';

describe('TestpostComponent', () => {
  let component: TestpostComponent;
  let fixture: ComponentFixture<TestpostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestpostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestpostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
