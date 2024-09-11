import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';

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
  /*
  
  invoiceForm: FormGroup;
  suggestions: any[][] = []; 

  isDropdownVisible: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpService) {
    this.invoiceForm = this.fb.group({
      customerName: [''],
      invoiceDate: [''],
      items: this.fb.array([]),
    });
    this.addItem();
  }

  addItem() {
    const itemForm = this.fb.group({
      medicineName: [''],
      price: [],
      quantity: [],
    });
    this.items.push(itemForm);
    this.suggestions.push([]);
  }

  // Getter for the items FormArray
  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  calculateTotal() {
    return this.items.controls.reduce((sum, item) => {
      const quantity = item.get('quantity')?.value;
      const price = item.get('price')?.value;
      return sum + quantity * price;
    }, 0);
  }
  downloadPDF() {
    const element = document.getElementById('invoice')!;
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('invoice.pdf');
    });
  }

  searchMedicine(index: any) {
    const searchText = this.items.controls.at(index)?.value.medicineName;
    if (Object.values(searchText).length > 2) {
      this.http.getProductByName(searchText).subscribe((res) => {
        console.log(res);
        if (Array.isArray(res)) {
          this.suggestions[index] = res; // Store suggestions for the specific row
        } else {
          this.suggestions[index] = []; // Clear suggestions if the response is not an array
        }
      });
    }
  }

  getSetPriceAndName(i: any, medicineName: any) {
    this.suggestions[i] = [i];
    this.items.controls.at(i)?.patchValue({ medicineName: medicineName });
    this.suggestions[i] = [i];
  }
    */

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
      invoiceID: [this.invoiceUniqueID],
      invoiceDate: [this.currentDate],
      grandTotalWithGST: [''],
      grandTotalWithOutGST: [''],
      total: [''],
      items: this.fb.array([]), // FormArray for invoice items
    });
    // Add one default item on load
    this.addItem();
    this.invoiceForm.valueChanges.subscribe((values) => {
      this.calculateTotal();
    });
  }

  // Getter for the items FormArray
  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  // Method to add a new item to the FormArray
  addItem() {
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
    itemForm.get('total')?.patchValue(total); // Update total without emitting valueChanges
    this.calculateTotal();
  }

  // When a suggestion is selected, populate only the corresponding FormGroup
  onSelectMedicine(medicine: any, index: number) {
    const itemFormGroup = this.items.at(index) as FormGroup;
    itemFormGroup.patchValue({
      medicineName: medicine.medicineName,
      price: medicine.price,
    });
    // Clear suggestions for the current row
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

  downloadPDF() {
    const element = document.getElementById('invoice')!;
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('invoice.pdf');
    });
  }

  deleteItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
    this.calculateTotal(); // Recalculate grand total after item removal
  }

  addGST() {
    this.showWithoutGST = true;
    this.grandTotalWithoutGst = this.total + this.gstAmount;
    this.invoiceForm.patchValue({
      grandTotalWithGST: this.grandTotalWithGst,
      grandTotalWithOutGST: this.grandTotalWithoutGst,
      total: this.total,
    });
  }

  removeGST() {
    this.showWithoutGST = false;
    this.grandTotalWithoutGst = this.total;
    this.invoiceForm.patchValue({
      grandTotalWithGST: this.grandTotalWithGst,
      grandTotalWithOutGST: this.grandTotalWithoutGst,
      total: this.total,
    });
  }

  onSearchName(query: string) {
    if (query.length > 2) {
      this.http.getPatientByName(query).subscribe(
        (res) => {
          this.suggestionsName = res as any;
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

  createInvoice() {
    this.invoiceForm.patchValue({
      invoiceID: this.invoiceUniqueID,
      invoiceDate: this.currentDate,
    });
    this.showProgressBar = true;
    setTimeout(
      () =>
        this.http.createInvoice(this.invoiceForm.value).subscribe(
          (res) => {
            this.showProgressBar = true;
            this.showAlert = true;
            setTimeout(() => (this.showAlert = false), 3000);
            this.showProgressBar = false;
            this.invoiceForm.reset();
          },
          (err) => {
            this.showProgressBar = true;
            this.invoiceForm.reset();
            this.showProgressBar = false;
          }
        ),
      3000
    );
  }
}
