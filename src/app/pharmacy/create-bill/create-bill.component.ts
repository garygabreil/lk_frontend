import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

export interface Medicine {
  medicineName: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-create-bill',
  templateUrl: './create-bill.component.html',
  styleUrl: './create-bill.component.css',
})
export class CreateBillComponent {
  clickedGSTlink: boolean = false;

  invoiceForm: FormGroup;
  suggestions: any[][] = []; // Array to store autocomplete suggestions for each row
  total: any;
  grandTotalWithGst: any;
  grandTotalWithOutGst: any;
  currentDate: any;
  showCreateNewMedicineLink: any;

  suggestionsName: any[] = [];

  gstRate: any = 18;
  gstAmount: any;
  showWithoutGST = false;
  showAddGSTButton = true;
  showWithGST = false;
  invoiceUniqueID = Math.floor(100000 + Math.random() * 900000);
  showProgressBar: any;
  showAlert: any;
  printId: any;
  noMedicineName: any;
  showCreateNewPatientLink: any;
  doctorData: any;
  disableSaveButton = false;

  no_stock_alert: any;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    this.invoiceForm = this.fb.group({
      patientName: ['', Validators.required],
      patientAddress: ['', Validators.required],
      pid: ['', Validators.required],
      title: [''],
      gender: [''],
      fatherName: [''],
      consultantName: ['', Validators.required],
      paymentType: [null, Validators.required],
      paymentStatus: [null, Validators.required],
      invoiceID: [this.invoiceUniqueID, Validators.required],
      invoiceDate: ['', Validators.required],
      grandTotalWithGST: [''],
      grandTotalWithOutGst: [''],
      total: [''],
      items: this.fb.array([]), // FormArray for invoice items
      gstAdded: [],
    });
    // Add one default item on load
    this.addItem();
    this.invoiceForm.valueChanges.subscribe((values) => {
      this.calculateTotal();
    });

    this.getAllDoctor();
  }
  getAllDoctor() {
    this.http.getAllDoctors().subscribe((res) => {
      this.doctorData = res as any;
    });
  }

  // Getter for the items FormArray
  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  formatDate(date: string): string {
    let dateObj = new Date(date);
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }
  // Method to add a new item to the FormArray
  addItem() {
    const itemForm = this.fb.group({
      medicineName: ['', Validators.required],
      price: ['', Validators.required],
      batch: [''],
      quantity: [''],
      expiryDate: [''],
      mid: [''],
      total: ['', Validators.required],
      mrp: ['', Validators.required],
      sgst: ['', Validators.required],
    });

    // Listen to changes in price or quantity to update the total for the item
    itemForm
      .get('price')
      ?.valueChanges.subscribe(() => this.updateTotal(itemForm));
    itemForm.get('quantity')?.valueChanges.subscribe(() => {
      this.updateTotal(itemForm);
    });

    this.items.push(itemForm);
    this.suggestions.push([]); // Add an empty array for suggestions for the new row
  }

  // Handle the search (Autocomplete) for a specific row
  onSearch(query: string, index: number) {
    if (query.length > 2) {
      // Call backend API to get the search suggestions
      this.http.getProductByName(query).subscribe(
        (res) => {
          this.suggestions[index] = res as any;
          // Store suggestions for the specific row
          if (this.suggestions[index].length == 0) {
            this.showCreateNewMedicineLink = true;
          }
          if (this.suggestions[index].length > 0) {
            this.showCreateNewMedicineLink = false;
          }
        },
        (error) => {
          console.error('Search error:', error);
        }
      );
    } else {
      this.suggestions[index] = []; // Clear suggestions if the query is too short
    }
  }

  updateTotal(itemForm: FormGroup) {
    const price = itemForm.get('price')?.value || 0;
    const quantity = itemForm.get('quantity')?.value || 0;
    const sgst = itemForm.get('sgst')?.value || 0;
    const total = price * quantity;
    const gst = (total * sgst) / 100;
    const totalAddingSgst = total + gst;
    itemForm.get('total')?.patchValue(totalAddingSgst); // Update total without emitting valueChanges
    this.calculateTotal();
  }

  // When a suggestion is selected, populate only the corresponding FormGroup
  onSelectMedicine(medicine: any, index: number) {
    const itemFormGroup = this.items.at(index) as FormGroup;
    itemFormGroup.patchValue({
      medicineName: medicine.medicineName,
      price: medicine.price,
      mid: medicine.mid,
      batch: medicine.batch,
      quantity: medicine.quantity,
      expiryDate: medicine.expiryDate,
      mrp: medicine.price,
      sgst: medicine.sgst,
    });

    this.checkQuantity(medicine.quantity, index);

    // Clear suggestions for the current row
    this.suggestions[index] = [];
  }

  checkQuantity(medicinPrice: any, index: any) {
    if (medicinPrice <= 0) {
      this.no_stock_alert = true;
    } else {
      this.no_stock_alert = false;
    }
  }

  parseDateToMMYYYY(dateString: string): string | null {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/; // Matches dd-mm-yyyy
    const match = dateString.match(regex);

    if (match) {
      const month = match[2]; // mm
      const year = match[3]; // yyyy
      const shortYear = year.slice(-2); // Get last two digits of the year

      // Return the formatted string as mm/yy
      return `${month}/${shortYear}`;
    }
    // Return null if the input format is invalid
    return null;
  }

  calculateTotal() {
    if (this.clickedGSTlink) {
      this.total = this.items.controls.reduce((acc, item) => {
        const total = item.get('total')?.value || 0;
        return acc + total;
      }, 0);
      this.gstAmount = (this.total * this.gstRate) / 100;
      this.grandTotalWithGst = this.total + this.gstAmount;
    } else {
      this.total = this.items.controls.reduce((acc, item) => {
        const total = item.get('total')?.value || 0;
        return acc + total;
      }, 0);
      this.gstAmount = (this.total * this.gstRate) / 100;
      this.grandTotalWithOutGst = this.total;
      //this.grandTotalWithGst = this.total + this.gstAmount;
    }
  }

  deleteItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
    this.calculateTotal(); // Recalculate grand total after item removal
  }

  // Method to reset FormArray and keep only one row
  resetFormArrayToOneRow() {
    const itemsArray = this.items;
    // Clear all existing controls in FormArray
    while (itemsArray.length !== 0) {
      itemsArray.removeAt(0);
    }
    // Add back one empty row (FormGroup) to the FormArray
    itemsArray.push(this.addItem());
  }

  addGST() {
    // this.showWithoutGST = true;
    this.showAddGSTButton = false;
    this.clickedGSTlink = true;
    this.invoiceForm.patchValue({
      grandTotalWithGST: this.grandTotalWithGst,
      gstAdded: this.clickedGSTlink,
    });
  }

  removeGST() {
    // this.showWithoutGST = false;
    this.showAddGSTButton = true;
    this.clickedGSTlink = false;
    this.invoiceForm.patchValue({
      grandTotalWithOutGst: this.grandTotalWithOutGst,
      gstAdded: this.clickedGSTlink,
    });
  }

  onSearchName(query: string) {
    if (query.length > 2) {
      this.http.getPatientByName(query).subscribe(
        (res) => {
          this.suggestionsName = res as any;
          if (this.suggestionsName.length == 0) {
            this.showCreateNewPatientLink = true;
          }
          if (this.suggestionsName.length > 0) {
            this.showCreateNewPatientLink = false;
          }
        },
        (error) => {
          console.error('Search error:', error);
        }
      );
    } else {
      this.suggestionsName = [];
    }
  }
  convertToISODate(dateString: string): string {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
  }

  async generateUniqueNumber() {
    this.invoiceUniqueID = await Math.floor(100000 + Math.random() * 900000);
    this.invoiceForm.patchValue({
      invoiceID: this.invoiceUniqueID,
    });
  }

  onSelectPatientName(res: any) {
    this.invoiceForm.patchValue({
      patientName: res.title + res.patientName,
      patientAddress: res.patientAddress,
      pid: res.pid,
      title: res.title,
      gender: res.gender,
      consultantName: res.consultantName,
      fatherName: res.fatherName,
    });
    this.suggestionsName = [];
  }

  createInvoice() {
    this.invoiceForm.patchValue({
      grandTotalWithGST: this.grandTotalWithGst,
      total: this.total,
      grandTotalWithOutGst: this.grandTotalWithOutGst,
    });

    this.invoiceForm.patchValue({
      invoiceID: this.invoiceUniqueID,
      invoiceDate: this.invoiceForm.value.invoiceDate,
    });
    this.showProgressBar = true;

    setTimeout(
      () =>
        this.http.createInvoice(this.invoiceForm.value).subscribe(
          (res: any) => {
            this.showProgressBar = true;
            this.showAlert = true;
            this.showProgressBar = false;
            this.showWithoutGST = false;
            this.inventoryCheck(this.items.value);
            this.disableSaveButton = true;

            //this.generateUniqueNumber();
            //this.invoiceForm.reset();
            this.printId = res['_id'];
          },
          (err) => {
            this.showProgressBar = true;
            this.invoiceForm.reset();
            this.showProgressBar = false;
            this.generateUniqueNumber();
          }
        ),
      1000
    );
  }

  newInvoice() {
    this.invoiceForm.reset();
    this.generateUniqueNumber();
  }

  inventoryCheck(ar: any) {
    this.http.updateQuantity(ar).subscribe((res) => {});
  }
  pharmaPatientCreation() {
    sessionStorage.setItem('locationss', 'pharmarcy');
  }
}
