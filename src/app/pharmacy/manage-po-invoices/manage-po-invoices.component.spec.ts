import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePoInvoicesComponent } from './manage-po-invoices.component';

describe('ManagePoInvoicesComponent', () => {
  let component: ManagePoInvoicesComponent;
  let fixture: ComponentFixture<ManagePoInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagePoInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePoInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
