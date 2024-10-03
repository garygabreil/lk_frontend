import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacySupplierCreationComponent } from './pharmacy-supplier-creation.component';

describe('PharmacySupplierCreationComponent', () => {
  let component: PharmacySupplierCreationComponent;
  let fixture: ComponentFixture<PharmacySupplierCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PharmacySupplierCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacySupplierCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
