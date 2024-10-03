import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyPatientCreationComponent } from './pharmacy-patient-creation.component';

describe('PharmacyPatientCreationComponent', () => {
  let component: PharmacyPatientCreationComponent;
  let fixture: ComponentFixture<PharmacyPatientCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PharmacyPatientCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyPatientCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
