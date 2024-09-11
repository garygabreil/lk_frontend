import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  invoiceForm: FormGroup;
  suggestions: any[][] = []; // Array to store autocomplete suggestions for each row
  total: any;
  grandTotalWithGst: any;
  grandTotalWithoutGst: any;
  currentDate: any;
  suggestionsName: any[] = [];

  gstRate: any = 18;
  gstAmount: any;
  showWithoutGST = false;
  showWithGST = false;
  invoiceUniqueID = Math.floor(100000 + Math.random() * 900000);
  showProgressBar: any;
  showAlert: any;

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

  @ViewChild('closeModal')
  closeModal!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe
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
      grandTotalWithOutGST: [''],
      total: [''],
      items: this.fb.array([]), // FormArray for invoice items
    });

    this.loadData();
    this.items.valueChanges.subscribe(() => this.calculateTotals());
  }

  // Getter for the items FormArray
  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  loadData() {
    this.http.getAllInvoices().subscribe((res) => {
      this.invoiceData = res as any;
      this.itemsData = res as any;
      this.totalNumberOfEntries = this.invoiceData.length;
    });
  }

  addItem1() {
    const itemForm = this.fb.group({
      medicineName: ['', Validators.required],
      price: ['', Validators.required],
      quantity: ['', Validators.required],
      total: ['', Validators.required],
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
    const total = price * quantity;
    itemForm.get('total')?.patchValue(total);
    this.calculateTotal();
  }

  onSelectMedicine(medicine: any, index: number) {
    const itemFormGroup = this.items.at(index) as FormGroup;
    itemFormGroup.patchValue({
      medicineName: medicine.medicineName,
      price: medicine.price,
    });
    this.suggestions[index] = [];
  }

  calculateTotal() {
    this.total = this.items.controls.reduce((acc, item) => {
      const total = item.get('total')?.value || 0;
      return acc + total;
    }, 0);
    this.gstAmount = (this.total * this.gstRate) / 100;
    this.grandTotalWithGst = this.total + this.gstAmount;
    this.grandTotalWithoutGst = this.total;
  }

  // downloadPDF() {
  //   const element = document.getElementById('invoice')!;
  //   html2canvas(element).then((canvas) => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF('p', 'mm', 'a4');
  //     const imgWidth = 210;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  //     pdf.save('invoice.pdf');
  //   });
  // }

  deleteItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
    this.calculateTotal();
  }

  addGST() {
    this.showWithoutGST = true;
    this.invoiceForm
      .get('grandTotalWithGST')
      ?.patchValue(this.grandTotalWithGst);
  }

  removeGST() {
    this.showWithoutGST = false;
  }

  onSearchName(query: string) {
    if (query.length > 2) {
      this.http.getPatientByName(query).subscribe(
        (res) => {
          this.suggestionsName = res as any;
          console.log(res);
        },
        (error) => {
          console.error('Search error:', error);
        }
      );
    } else {
      this.suggestionsName = [];
    }
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
    const quantity = item.get('quantity')?.value || 0;
    const price = item.get('price')?.value || 0;
    const total = quantity * price;
    item.get('total')?.setValue(total, { emitEvent: false });
  }

  calculateTotals() {
    let totalWithoutGST = 0;
    let totalWithGST = 0;

    this.items.controls.forEach((itemFormGroup) => {
      const totalPrice = itemFormGroup.get('total')?.value || 0;
      totalWithoutGST += totalPrice;
      this.total = totalPrice;
    });
    const gstRate = 0.18; // Example GST rate of 18%
    totalWithGST = totalWithoutGST * (1 + gstRate);
    this.grandTotalWithGst = totalWithGST;
    this.grandTotalWithoutGst = totalWithoutGST;
    this.invoiceForm.get('grandTotalWithOutGST')?.patchValue(totalWithoutGST);
    this.invoiceForm.get('grandTotalWithGST')?.patchValue(totalWithGST);
    this.invoiceForm.get('total')?.patchValue(totalWithoutGST);
  }

  onSelectPatientName(res: any) {
    this.invoiceForm.patchValue({
      patientName: res.title + res.patientName,
      patientAddress: res.patientAddress,
      pid: res.pid,
      title: res.title,
      gender: res.gender,
      fatherName: res.fatherName,
      consultantName: res.consultantName,
    });
    this.suggestionsName = [];
  }

  viewInvoice(id: any) {
    this.http.getInvoiceById(id).subscribe((res: any) => {
      this.invoiceForm = this.fb.group({
        patientName: res['patientName'],
        patientAddress: res['patientAddress'],
        pid: res['pid'],
        title: res['title'],
        gender: ['gender'],
        fatherName: ['fatherName'],
        consultantName: ['consultantName'],
        paymentType: res['paymentType'],
        paymentStatus: res['paymentStatus'],
        invoiceID: res['invoiceID'],
        invoiceDate: this.convertToISODate(res['invoiceDate']),
        grandTotalWithGST: res['grandTotalWithGST'],
        grandTotalWithOutGST: res['grandTotalWithOutGST'],
        total: res['total'],
        items: this.fb.array([]), // FormArray for invoice items
      });
      sessionStorage.setItem('editInvoiceyId', id);
      this.grandTotalWithGst = res['grandTotalWithGST'];
      this.grandTotalWithoutGst = res['grandTotalWithGST'];
      this.total = res['total'];
      this.initializeItems(res['items']);
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

  updateInvoice() {
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
          },
          (err) => {
            console.log(err);
          }
        ),
      3000
    );
  }
}
