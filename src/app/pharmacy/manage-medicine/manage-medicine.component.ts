import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';
import { ReminderService } from '../../services/reminder.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-medicine',
  templateUrl: './manage-medicine.component.html',
  styleUrl: './manage-medicine.component.css',
})
export class ManageMedicineComponent {
  pharmacyForm: FormGroup;
  searchForm: FormGroup;

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
  showAlertForUpdate: any;

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

  medicineReminders: { name: string; expiryDate: string; reminder: string }[] =
    [];
  reminderMessages: string[] = []; // Store reminder messages for scrolling

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe,
    public reminderService: ReminderService,
    public httpClient: HttpClient
  ) {
    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';

    this.searchForm = this.fb.group({
      medicineName: [''],
      batch: [''],
      hsn_code: [''],
    });

    this.pharmacyForm = this.fb.group({
      medicineName: ['', Validators.required],
      batch: ['', Validators.required],
      expiryDate: ['', Validators.required],
      price: [0, Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      hsn_code: ['', Validators.required],
      sgst: ['', Validators.required],
      createdAt: [''],
      createdBy: [''],
      updatedBy: [''],
      updatedOn: [''],
      mid: [''],
    });
    this.loadData();
  }

  loadData() {
    this.http.getAllProducts().subscribe((res) => {
      this.medicineData = res as any;
      this.totalNumberOfEntries = this.medicineData.length;
      this.checkReminders();
    });
  }

  async editMedicineById(id: any) {
    await this.http.getProductById(id).subscribe((res: any) => {
      this.pharmacyForm = this.fb.group({
        medicineName: [res['medicineName'], Validators.required],
        price: [res['price'], Validators.required],
        quantity: [res['quantity'], [Validators.required, Validators.min(1)]],
        hsn_code: [res['hsn_code'], [Validators.required]],
        batch: [res['batch'], [Validators.required]],
        mid: [res['mid'], [Validators.required]],
        expiryDate: [
          this.convertToISODate(res['expiryDate']),
          Validators.required,
        ],
        createdAt: this.convertToISODate(res['createdAt']),
        createdBy: res['createdBy'],
        sgst: [res['sgst'], Validators.required],
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

  //date formatter
  formatDate(date: string): string {
    let dateObj = new Date(date);
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  updateChanges() {
    this.showProgressBar = true;
    setTimeout(
      () =>
        this.http
          .updateProductById(sessionStorage.getItem('editMedicineById'), {
            medicineName: this.pharmacyForm.value.medicineName,
            price: this.pharmacyForm.value.price,
            quantity: this.pharmacyForm.value.quantity,
            expiryDate: this.formatDate(this.pharmacyForm.value.expiryDate),
            createdAt: this.formatDate(this.pharmacyForm.value.createdAt),
            hsn_code: this.pharmacyForm.value.hsn_code,
            batch: this.pharmacyForm.value.batch,
            priceOfOne: this.pharmacyForm.value.priceOfOne,
            createdBy: this.pharmacyForm.value.createdBy,
            updatedBy: sessionStorage.getItem('user'),
            updatedOn: this.convertToISODate(this.currentDate),
            mid: this.pharmacyForm.value.mid,
          })
          .subscribe(
            (res) => {
              this.showProgressBar = true;
              this.showAlertForUpdate = true;
              setTimeout(() => (this.showAlertForUpdate = false), 3000);
              this.showProgressBar = false;
              this.loadData();
              window.location.reload();
            },
            (err) => {
              this.showProgressBar = true;
              this.showAlertForUpdate = false;
              setTimeout(() => (this.showAlertForUpdate = false), 3000);
              this.showProgressBar = false;
              this.showAlertForUpdate = false;
              sessionStorage.removeItem('editMedicineById');
              this.loadData();
              window.location.reload();
            }
          ),
      1000
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
    }, 1000);
    window.location.reload();
  }

  deleteSessionByID() {
    sessionStorage.removeItem('deleteMedicineById');
  }

  editSessionByID() {
    sessionStorage.removeItem('editMedicineById');
  }

  calculatePerQun() {
    this.pharmacyForm.patchValue({
      priceOfOne:
        this.pharmacyForm.value.quantity / this.pharmacyForm.value.price,
    });
  }
  // Parse input value and format it correctly
  onPriceChange(event: any) {
    const value = parseFloat(event.target.value);
    this.price = isNaN(value) ? 0 : parseFloat(value.toFixed(2)); // Ensure the input is a valid number with 2 decimals
  }

  price: number = 0; // Default price value

  get formattedPrice(): string {
    return this.price.toFixed(2); // Formats the number to always show 2 decimals
  }

  public checkReminders(): void {
    const now = new Date();

    this.medicineData.forEach((medicine) => {
      const expiryDateString = medicine.expiryDate; // Assuming expiryDate is in dd-mm-yyyy format
      const expiryDate = this.reminderService.parseDate(expiryDateString); // Now accessible
      const reminderDate = new Date(expiryDate);
      reminderDate.setMonth(reminderDate.getMonth() - 1); // One month before

      // Check if today is the reminder date
      if (now.toDateString() === reminderDate.toDateString()) {
        const reminderMessage = `Reminder: The expiry date for ${
          medicine.medicineName
        } is approaching on ${expiryDate.toLocaleDateString()}`;
        this.reminderMessages.push(reminderMessage);
      }
      this.medicineReminders.push({
        name: medicine.name,
        expiryDate: expiryDate.toLocaleDateString(),
        reminder: '',
      });
    });
  }
  getStatus(expiryDateString: string): string {
    const expiryDate = this.reminderService.parseDate(expiryDateString);
    const now = new Date();
    const reminderDate = new Date(expiryDate);
    reminderDate.setMonth(reminderDate.getMonth() - 1); // Reminder 1 month before

    if (now > expiryDate) {
      return 'Expired';
    } else if (now > reminderDate) {
      return 'Reminder Due';
    } else {
      return 'Valid';
    }
  }
  groupedInvoicesBySpecificSearch: any;
  totalNumberOfEntriesForSpecificSearch: any;
  groupedInvoicesBySpecificDateSearch: any;

  searchBySpecific() {
    const searchCriteria = {
      medicineName: this.searchForm.value.medicineName,
      batch: this.searchForm.value.batch,
      hsn_code: this.searchForm.value.hsn_code,
    };

    this.httpClient
      .post('http://localhost:3000/api/product/search', searchCriteria)
      .subscribe(
        (res: any) => {
          this.groupedInvoicesBySpecificSearch = res;
          this.totalNumberOfEntriesForSpecificSearch =
            Object.values(res).length;
        },
        (err) => {
          this.groupedInvoicesBySpecificSearch = [];
          this.totalNumberOfEntriesForSpecificSearch = 0;
        }
      );
    this.searchForm.reset();
  }
}
