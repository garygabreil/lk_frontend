import { DatePipe } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-pharmacy-supplier-creation',
  templateUrl: './pharmacy-supplier-creation.component.html',
  styleUrl: './pharmacy-supplier-creation.component.css',
})
export class PharmacySupplierCreationComponent {
  pharmacyForm: FormGroup;
  showProgressBar: any;
  showAlert: any;
  currentDate: any;
  showExistAlert: any;
  midUniqueID: any;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  private isCtrlSPressed = false; // Flag to prevent multiple triggers
  private isCtrlNPressed = false;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private http: HttpService
  ) {
    this.generateUniqueNumber();
    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';
    this.pharmacyForm = this.fb.group({
      medicineName: [''],
      batch: [''],
      expiryDate: [''],
      price: [0],
      quantity: [0],
      hsn_code: [''],
      sgst: [0],
      createdAt: [''],
      createdBy: [''],
      updatedBy: [''],
      updatedOn: [''],
      supplierName: ['', Validators.required],
      supplierAddress: ['', Validators.required],
      supplierPhone: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
      mid: [''],
    });
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's' && !this.isCtrlSPressed) {
      event.preventDefault(); // Prevent the browser's default behavior
      this.isCtrlSPressed = true; // Set the flag to true
      this.createMedicine(); // Call your save method
    }
    if (event.ctrlKey && event.key === 'n' && !this.isCtrlNPressed) {
      event.preventDefault(); // Prevent the browser's default behavior
      this.isCtrlNPressed = true; // Set the flag to true
      this.refresh(); // Call your save method
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control' || event.key === 's') {
      this.isCtrlSPressed = false; // Reset the flag when either key is released
    }
    if (event.key === 'Control' || event.key === 'n') {
      this.isCtrlNPressed = false; // Reset the flag when either key is released
    }
  }
  price: number = 0; // Default price value

  get formattedPrice(): string {
    return this.price.toFixed(2); // Formats the number to always show 2 decimals
  }

  // Parse input value and format it correctly
  onPriceChange(event: any) {
    const value = parseFloat(event.target.value);
    this.price = isNaN(value) ? 0 : parseFloat(value.toFixed(2)); // Ensure the input is a valid number with 2 decimals
  }

  calculatePerQun() {
    this.pharmacyForm.patchValue({
      priceOfOne:
        this.pharmacyForm.value.quantity / this.pharmacyForm.value.price,
    });
  }

  createMedicine() {
    this.showProgressBar = true;
    setTimeout(() => {
      this.http
        .createProduct({
          createdAt: this.currentDate,
          createdBy: sessionStorage.getItem('user'),
          mid: this.pharmacyForm.value.mid,
          supplierName: this.pharmacyForm.value.supplierName,
          supplierAddress: this.pharmacyForm.value.supplierAddress,
          supplierPhone: this.pharmacyForm.value.supplierPhone,
        })
        .subscribe(
          (res) => {
            this.showProgressBar = true;
            this.showAlert = true;
            this.showProgressBar = false;
            this.pharmacyForm.reset();
            this.generateUniqueNumber();
          },
          (err) => {
            this.showProgressBar = true;
            this.showExistAlert = true;
            this.pharmacyForm.reset();
            this.showExistAlert = err.status;
            this.showProgressBar = false;
            this.generateUniqueNumber();
          }
        );
    }, 1000);
  }

  //date formatter
  formatDate(date: string): string {
    let dateObj = new Date(date);
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async generateUniqueNumber() {
    this.midUniqueID = await Math.floor(100000 + Math.random() * 900000);
    this.pharmacyForm.patchValue({
      mid: this.midUniqueID,
    });
  }

  monthYearValidator(control: any) {
    const validFormat = /^(0[1-9]|1[0-2])\/\d{4}$/; // MM/YYYY format
    return validFormat.test(control.value) ? null : { invalidFormat: true };
  }

  refresh() {
    window.location.reload();
  }
}
