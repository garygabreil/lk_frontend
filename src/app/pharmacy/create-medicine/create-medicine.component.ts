import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { error } from 'console';

@Component({
  selector: 'app-create-medicine',
  templateUrl: './create-medicine.component.html',
  styleUrl: './create-medicine.component.css',
})
export class CreateMedicineComponent {
  pharmacyForm: FormGroup;
  showProgressBar: any;
  showAlert: any;
  currentDate: any;
  showExistAlert: any;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private http: HttpService
  ) {
    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';
    this.pharmacyForm = this.fb.group({
      medicineName: ['', Validators.required],
      price: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      expiryDate: ['', Validators.required],
      createdAt: [''],
      createdBy: [''],
      updatedBy: [''],
      updatedOn: [''],
    });
  }

  createMedicine() {
    this.showProgressBar = true;
    setTimeout(() => {
      this.http
        .createProduct({
          medicineName: this.pharmacyForm.value.medicineName,
          price: this.pharmacyForm.value.price,
          quantity: this.pharmacyForm.value.quantity,
          expiryDate: this.formatDate(this.pharmacyForm.value.expiryDate),
          createdAt: this.currentDate,
          createdBy: sessionStorage.getItem('user'),
          updatedBy: '',
          updatedOn: '',
        })
        .subscribe(
          (res) => {
            this.showProgressBar = true;
            this.showAlert = true;
            setTimeout(() => (this.showAlert = false), 3000);
            this.showProgressBar = false;
            this.pharmacyForm.reset();
          },
          (err) => {
            this.showProgressBar = true;
            this.showExistAlert = true;
            this.pharmacyForm.reset();
            this.showExistAlert = err.status;
            this.showProgressBar = false;
          }
        );
    }, 3000);
  }

  //date formatter
  formatDate(date: string): string {
    let dateObj = new Date(date);
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
