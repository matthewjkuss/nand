import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipExteriorComponent } from './chip-exterior.component';

describe('ChipExteriorComponent', () => {
  let component: ChipExteriorComponent;
  let fixture: ComponentFixture<ChipExteriorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChipExteriorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipExteriorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
