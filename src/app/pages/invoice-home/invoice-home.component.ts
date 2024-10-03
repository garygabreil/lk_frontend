import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-home',
  templateUrl: './invoice-home.component.html',
  styleUrl: './invoice-home.component.css',
})
export class InvoiceHomeComponent {
  @ViewChild('closeModal')
  closeModal!: ElementRef;

  @ViewChild('closeModal1')
  closeModal1!: ElementRef;
  constructor(private router: Router) {}

  goToCreatePatient() {
    this.router.navigateByUrl('/create-patient-pharmacy');
    this.closeModal.nativeElement.click();
  }

  goToCreateDoctor() {
    this.router.navigateByUrl('/create-doctor');
    this.closeModal.nativeElement.click();
  }

  goToCreateStaff() {
    this.router.navigateByUrl('/create-staff');
    this.closeModal.nativeElement.click();
  }

  goToManagePatient() {
    this.router.navigateByUrl('/manage-patient');
    this.closeModal1.nativeElement.click();
  }

  goToManageDoctor() {
    this.router.navigateByUrl('/manage-doctor');
    this.closeModal1.nativeElement.click();
  }

  goToManageStaff() {
    this.router.navigateByUrl('/manage-staff');
    this.closeModal1.nativeElement.click();
  }
}
