import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIndividualInvoicesComponent } from './view-individual-invoices.component';

describe('ViewIndividualInvoicesComponent', () => {
  let component: ViewIndividualInvoicesComponent;
  let fixture: ComponentFixture<ViewIndividualInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewIndividualInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewIndividualInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
