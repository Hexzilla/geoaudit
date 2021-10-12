import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbrioxSelectModalComponent } from './abriox-select-modal.component';

describe('ArchiveModalComponent', () => {
  let component: AbrioxSelectModalComponent;
  let fixture: ComponentFixture<AbrioxSelectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbrioxSelectModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbrioxSelectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
