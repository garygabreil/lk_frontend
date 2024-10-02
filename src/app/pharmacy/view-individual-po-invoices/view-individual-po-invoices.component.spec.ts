import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIndividualPoInvoicesComponent } from './view-individual-po-invoices.component';

describe('ViewIndividualPoInvoicesComponent', () => {
  let component: ViewIndividualPoInvoicesComponent;
  let fixture: ComponentFixture<ViewIndividualPoInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewIndividualPoInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewIndividualPoInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
