import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipInteriorComponent } from './chip-interior.component';

describe('ChipInteriorComponent', () => {
  let component: ChipInteriorComponent;
  let fixture: ComponentFixture<ChipInteriorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChipInteriorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipInteriorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
