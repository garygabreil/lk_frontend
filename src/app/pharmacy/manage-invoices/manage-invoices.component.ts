import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { error } from 'console';

@Component({
  selector: 'app-manage-invoices',
  templateUrl: './manage-invoices.component.html',
  styleUrl: './manage-invoices.component.css',
})
export class ManageInvoicesComponent {
  totalPaid: any;
  totalUnPaid: any;
  totalPending: any;
  totalNumberOfEntries: any;
  totalNumberOfEntriesForSpecific: any;
  invoiceForm: FormGroup;
  searchForm: FormGroup;

  suggestions: any[][] = []; // Array to store autocomplete suggestions for each row
  total: any;
  grandTotalWithGst: any;
  currentDate: any;
  suggestionsName: any[] = [];
  showCreateNewPatientLink: any;

  gstRate: any = 18;
  gstAmount: any;
  showWithoutGST = false;
  showWithGST = false;
  invoiceUniqueID = Math.floor(100000 + Math.random() * 900000);
  showProgressBar: any;
  showAlert: any;
  GSTLinkClickedOrNot: boolean = false;

  itemsData: any[] = []; // Data for DataTable

  //progressbar

  //patientData
  invoiceData: any[] = [];
  columns: any[] = []; // Column definitions for DataTable

  //search bar
  search: string = '';

  //pagination
  p: number = 1;
  // alert

  paymentType: string = '';
  paymentStatus: string = '';
  patientName: string = '';
  invoiceDate: string = '';

  @ViewChild('closeModal')
  closeModal!: ElementRef;

  showDeleteProgressBar: any;
  showDeleteAlert: any;
  selectedDate?: Date; // This holds the date from the user input
  formattedDate: any;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe,
    private router: Router,
    private httpClient: HttpClient
  ) {
    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';

    this.invoiceForm = this.fb.group({
      patientName: [''],
      patientAddress: [''],
      pid: [''],
      title: [''],
      gender: [''],
      fatherName: [''],
      consultantName: [''],
      paymentType: [null],
      paymentStatus: [null],
      invoiceID: [],
      invoiceDate: [],
      grandTotalWithGST: [''],
      total: [''],
      items: this.fb.array([]), // FormArray for invoice items
      gstAdded: [''],
    });
    this.searchForm = this.fb.group({
      patientName: [''],
      paymentType: [''],
      paymentStatus: [''],
      invoiceDate: [''],
    });

    this.items.valueChanges.subscribe(() => this.calculateTotals());
    this.getAllInvoicesForToday();
    this.formattedDate = this.selectedDate?.toISOString(); // Convert date to ISO string format
    this.loadData();
  }

  groupedInvoicesByToday: any = [];
  groupedInvoicesBySpecificDate: any = [];
  invoiceDataForSpecificDate: any = [];

  // getAllInvoices
  getAllInvoicesForToday() {
    const todayDate = this.getTodayDate();
    this.http.getInvoicesSpecificDate(todayDate).subscribe(
      (res) => {
        if (res) {
          this.invoiceData = res as any;
          this.totalNumberOfEntries = this.invoiceData.length;
        } else {
          this.invoiceData = [];
          this.totalNumberOfEntries = 0;
        }
      },
      (err) => {
        if (err.error.message == 'No_invoices') {
          this.invoiceData = [];
          this.totalNumberOfEntries = 0;
        }
      }
    );
  }

  getTodayDate(): string {
    const today = new Date();
    return this.datePipe.transform(today, 'dd-MM-yyyy') || '';
  }

  datePickerDateConversion(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Getter for the items FormArray
  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  invoiceDataAll: any;
  totalNumberOfEntriesAll: any;
  loadData() {
    this.http.getAllInvoices().subscribe((res) => {
      this.invoiceDataAll = res as any;
      this.totalNumberOfEntriesAll = this.invoiceDataAll.length;
    });
  }

  addItem1() {
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
    itemForm
      .get('quantity')
      ?.valueChanges.subscribe(() => this.updateTotal(itemForm));

    this.items.push(itemForm);
    this.suggestions.push([]); // Add an empty array for suggestions for the new row
  }

  addItem(item: any) {
    const itemFormGroup = this.fb.group({
      medicineName: [item.medicineName || ''],
      price: [item.price || 1],
      quantity: [item.quantity || 0],
      total: [{ value: item.quantity * item.price }],
    });
    this.items.push(itemFormGroup);
    this.calculateTotals(); // Recalculate totals whenever an item is added
  }

  // Handle the search (Autocomplete) for a specific row
  onSearch(query: string, index: number) {
    if (query.length > 2) {
      // Call backend API to get the search suggestions
      this.http.getProductByName(query).subscribe(
        (res) => {
          this.suggestions[index] = res as any; // Store suggestions for the specific row
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
    itemForm.get('total')?.patchValue(totalAddingSgst);
    this.calculateTotal();
  }

  onSelectMedicine(medicine: any, index: number) {
    const itemFormGroup = this.items.at(index) as FormGroup;
    itemFormGroup.patchValue({
      medicineName: medicine.medicineName,
      price: medicine.price,
      mid: medicine.mid,
      batch: medicine.batch,
      quantity: medicine.quantity,
      expiryDate: this.parseDateToMMYYYY(medicine.expiryDate),
      mrp: medicine.price,
      sgst: medicine.sgst,
    });
    this.suggestions[index] = [];
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
    this.total = this.items.controls.reduce((acc, item) => {
      const total = item.get('total')?.value || 0;
      return acc + total;
    }, 0);
    this.gstAmount = (this.total * this.gstRate) / 100;
    this.grandTotalWithGst = this.total + this.gstAmount;
  }

  deleteItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
    this.calculateTotal();
  }

  addGST() {
    this.showWithoutGST = true;
    this.GSTLinkClickedOrNot = true;
    this.invoiceForm.patchValue({
      gstAdded: this.GSTLinkClickedOrNot,
    });
    this.calculateTotal();
  }

  removeGST() {
    this.showWithoutGST = false;
    this.GSTLinkClickedOrNot = false;
    this.invoiceForm.patchValue({
      gstAdded: this.GSTLinkClickedOrNot,
      grandTotalWithGST: this.invoiceForm.value.total,
    });
  }

  generateUniqueNumber() {
    this.invoiceUniqueID = Math.floor(100000 + Math.random() * 900000);
    this.invoiceForm.patchValue({
      invoiceID: this.invoiceUniqueID,
    });
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotals(); // Recalculate totals whenever an item is removed
  }

  updateItem(index: number, field: string, value: any) {
    const item = this.items.at(index) as FormGroup;
    item.get(field)?.setValue(value);
    this.calculateItemTotal(index); // Recalculate total for the specific item
    this.calculateTotals(); // Recalculate overall totals
  }

  calculateItemTotal(index: number) {
    const item = this.items.at(index) as FormGroup;
    const quantity = item.get('quantity')?.value;
    const price = item.get('price')?.value;
    const total = quantity * price;
    this.setItemTotal(item, total);
    this.GSTLinkClickedOrNot = false;
  }

  setItemTotal(i: any, total: any) {
    i.patchValue({ total: total });
  }

  calculateTotals() {
    let totalWithoutGST: number = 0;
    let totalWithGST: number = 0;
    this.items.controls.forEach((itemFormGroup) => {
      const totalPrice = itemFormGroup.get('total')?.value | 0;
      totalWithoutGST += totalPrice;
      this.total = totalPrice;
    });
    const gstRate = 0.18; // Example GST rate of 18%
    totalWithGST = totalWithoutGST * (1 + gstRate);
    this.grandTotalWithGst = +totalWithGST.toFixed(2); // Round to 2 decimal places
    this.invoiceForm
      .get('grandTotalWithGST')
      ?.patchValue(this.grandTotalWithGst);
    this.invoiceForm.get('total')?.patchValue(this.total);
  }

  onSelectPatientName(res: any) {
    this.searchForm.patchValue({
      patientName: res.patientName,
    });

    this.suggestionsName = [];
  }

  viewInvoice(id: any) {
    this.router.navigate(['/view-invoice', id]);
  }

  //date formatter
  convertToISODate(date: string) {
    let parts = date.split('-');
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];
    return `${year}-${month}-${day}`;
  }

  initializeItems(items: any) {
    const itemsArray = this.invoiceForm.get('items') as FormArray;
    items.forEach((item: any) => {
      itemsArray.push(
        this.fb.group({
          medicineName: [item.medicineName],
          quantity: [item.quantity],
          price: [item.price],
          total: [item.total],
        })
      );
    });
  }

  editSessionByID() {
    sessionStorage.removeItem('editInvoiceyId');
  }

  deleteSessionByID() {
    sessionStorage.removeItem('deleteInvoiceById');
  }

  onPrint() {
    window.print();
  }
  formatDate(date: string): string {
    let dateObj = new Date(date);
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  updateInvoice() {
    this.invoiceForm.patchValue({
      invoiceID: this.invoiceUniqueID,
      invoiceDate: this.invoiceForm.value.invoiceDate,
    });
    this.showProgressBar = true;
    let id = sessionStorage.getItem('editInvoiceyId');

    setTimeout(
      () =>
        this.http.updateInvoiceById(id, this.invoiceForm.value).subscribe(
          (res) => {
            this.showProgressBar = true;
            this.showAlert = true;
            setTimeout(() => (this.showAlert = false), 3000);
            this.showProgressBar = false;
            sessionStorage.removeItem('editInvoiceyId');
            this.loadData();
            this.getAllInvoicesForToday();
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
    sessionStorage.setItem('deleteInvoiceById', id);
  }

  //delete
  deleteInvoice() {
    this.showDeleteProgressBar = true;
    setTimeout(() => {
      this.showDeleteAlert = true;
      this.http
        .deleteInvoiceById(sessionStorage.getItem('deleteInvoiceById'))
        .subscribe(
          (res) => {
            this.closeModal.nativeElement.click();
            this.showDeleteProgressBar = false;
            this.loadData();
            this.getAllInvoicesForToday();
            sessionStorage.removeItem('deleteInvoiceById');
          },
          (err) => {
            console.log(err.message);
          }
        );
    }, 1000);
  }

  paymentStatuses: string[] = ['PAID', 'NOT_PAID', 'PENDING'];
  paymentTypes: string[] = [
    'UPI',
    'CASH',
    'NETBANKING',
    'CARD_DEBIT',
    'CARD_CREDIT',
  ];

  searchInvoices() {
    this.formattedDate = this.selectedDate?.toISOString();
    const datePicker = this.datePipe.transform(
      this.searchForm.value.invoiceDate,
      'dd-MM-yyyy'
    );

    const searchCriteria = {
      paymentType: this.searchForm.value.paymentType,
      paymentStatus: this.searchForm.value.paymentStatus,
      patientName: this.searchForm.value.patientName,
      invoiceDate: datePicker, // Ensure correct format
    };

    this.httpClient
      .post('http://localhost:3000/api/invoices/searchInvoice', searchCriteria)
      .subscribe(
        (res: any) => {
          this.groupedInvoicesBySpecificDate = res;
          this.totalNumberOfEntriesForSpecific =
            this.groupedInvoicesBySpecificDate.length;
        },
        (err) => {
          this.groupedInvoicesBySpecificDate = [];
          this.totalNumberOfEntriesForSpecific = 0;
        }
      );
    this.searchForm.reset();
  }

  resetSearch() {
    this.paymentType = '';
    this.paymentStatus = '';
    this.patientName = '';
    this.invoiceDate = '';
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
}
