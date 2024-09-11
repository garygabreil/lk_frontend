import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-manage-medicine',
  templateUrl: './manage-medicine.component.html',
  styleUrl: './manage-medicine.component.css',
})
export class ManageMedicineComponent {
  pharmacyForm: FormGroup;

  //progressbar
  showProgressBar: any;

  //patientData
  medicineData: any[] = [];

  //search bar
  search: string = '';

  //pagination
  p: number = 1;

  //totalNumberOfEntries
  totalNumberOfEntries: any;

  // alert
  showAlert: any;

  //age
  age: any;

  //deleteProgress
  showDeleteProgressBar: any;

  //deleteAlert
  showDeleteAlert: any;

  //currentDate
  currentDate: string;

  @ViewChild('closeModal')
  closeModal!: ElementRef;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe
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
    this.loadData();
  }

  loadData() {
    this.http.getAllProducts().subscribe((res) => {
      this.medicineData = res as any;
      this.totalNumberOfEntries = this.medicineData.length;
    });
  }

  async editMedicineById(id: any) {
    await this.http.getProductById(id).subscribe((res: any) => {
      this.pharmacyForm = this.fb.group({
        medicineName: [res['medicineName'], Validators.required],
        price: [res['price'], Validators.required],
        quantity: [res['quantity'], [Validators.required, Validators.min(1)]],
        expiryDate: [
          this.convertToISODate(res['expiryDate']),
          Validators.required,
        ],
        createdAt: [res['createdAt']],
        createdBy: [res['createdBy']],
        updatedBy: [''],
        updatedOn: [''],
      });
      sessionStorage.setItem('editMedicineById', id);
    });
  }
  //date formatter
  convertToISODate(date: string) {
    let parts = date.split('-');
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];
    return `${year}-${month}-${day}`;
  }

  updateChanges() {
    this.showProgressBar = true;
    setTimeout(
      () =>
        this.http
          .updateProductById(sessionStorage.getItem('editMedicineById'), {
            medicineName: [
              [this.pharmacyForm.value.medicineName, null].filter(Boolean)[0],
              Validators.required,
            ],
            price: [this.pharmacyForm.value.price, Validators.required],
            quantity: [
              this.pharmacyForm.value.quantity,
              [Validators.required, Validators.min(1)],
            ],
            expiryDate: [
              this.pharmacyForm.value.expiryDate,
              Validators.required,
            ],
            createdAt: [this.pharmacyForm.value.createdAt],
            createdBy: [this.pharmacyForm.value.createdBy],
            updatedBy: sessionStorage.getItem('user'),
            updatedOn: this.currentDate,
          })
          .subscribe(
            (res) => {
              this.showProgressBar = true;
              this.showAlert = true;
              setTimeout(() => (this.showAlert = false), 3000);
              this.showProgressBar = false;
              this.showAlert = false;
              sessionStorage.removeItem('editMedicineById');
              this.loadData();
            },
            (err) => {
              console.log(err);
            }
          ),
      3000
    );
  }
  //delete patient by id
  deleteMedicineById(id: any) {
    sessionStorage.setItem('deleteMedicineById', id);
  }

  //delete
  deleteMedicine() {
    this.showDeleteProgressBar = true;
    setTimeout(() => {
      this.showDeleteAlert = true;
      this.http
        .deleteProductById(sessionStorage.getItem('deleteMedicineById'))
        .subscribe(
          (res) => {
            this.closeModal.nativeElement.click();
            this.showDeleteProgressBar = false;
            this.loadData();
            sessionStorage.removeItem('deleteMedicineById');
          },
          (err) => {
            console.log(err.message);
          }
        );
    }, 3000);
  }

  deleteSessionByID() {
    sessionStorage.removeItem('deleteMedicineById');
  }

  editSessionByID() {
    sessionStorage.removeItem('editMedicineById');
  }
}
