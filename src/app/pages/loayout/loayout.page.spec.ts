import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoayoutPage } from './loayout.page';

describe('LoayoutPage', () => {
  let component: LoayoutPage;
  let fixture: ComponentFixture<LoayoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoayoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
