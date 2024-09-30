import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-view-individual-invoices',
  templateUrl: './view-individual-invoices.component.html',
  styleUrl: './view-individual-invoices.component.css',
})
export class ViewIndividualInvoicesComponent implements OnInit, OnDestroy {
  totalPaid: any;
  totalUnPaid: any;
  totalPending: any;
  totalNumberOfEntries: any;
  totalNumberOfEntriesForSpecific: any;
  invoiceForm: FormGroup;
  suggestions: any[][] = []; // Array to store autocomplete suggestions for each row
  total: any;
  grandTotalWithGst: any;
  currentDate: any;
  suggestionsName: any[] = [];
  showCreateNewMedicineLink: any;

  gstRate: any = 18;
  gstAmount: any = 0;
  showWithoutGST = false;
  showWithGST = false;
  invoiceUniqueID = Math.floor(100000 + Math.random() * 900000);
  showProgressBar: any;
  showAlert: any;
  itemsData: any[] = []; // Data for DataTable
  grandTotalWithOutGst: any;
  doctorData: any;
  printTriggered: boolean = false; // Flag to track print state

  //progressbar

  showCreateNewPatientLink: any;
  //patientData
  invoiceData: any[] = [];
  columns: any[] = []; // Column definitions for DataTable

  //search bar
  search: string = '';

  //pagination
  p: number = 1;
  // alert

  showDeleteProgressBar: any;
  showDeleteAlert: any;
  selectedDate?: Date; // This holds the date from the user input
  formattedDate: any;
  invoiceNumber: any;
  clickedGSTlink: boolean = false;
  noStockAlert: boolean[] = [];
  currentInputIndex: number = 0; // Index of the current input
  selectedSuggestionIndex: number = -1; // Initialize to -1 for no selection
  selectedPatientIndex: number = -1;
  suggestionsPatientName: any[] = []; // Ensure this is initialized properly

  private printDialogOpen: boolean = false;

  ngOnInit() {
    // Add keydown event listener
    if (isPlatformBrowser(this.platformId)) {
      // Add keydown event listener
      document.addEventListener('keydown', this.handleKeyboardEvent.bind(this));
    }
  }

  ngOnDestroy() {
    // Clean up the event listener when the component is destroyed
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener(
        'keydown',
        this.handleKeyboardEvent.bind(this)
      );
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault(); // Prevent the default save dialog
      this.updateInvoice(); // Call the method to save
    } else if (event.ctrlKey && event.key === 'p') {
      event.preventDefault(); // Prevent the default print action
      this.triggerPrint();
    }
  }
  triggerPrint() {
    if (!this.printTriggered) {
      this.printTriggered = true; // Set the flag to prevent multiple print dialogs
      this.printInvoice(); // Call print function
    }
  }

  printInvoice() {
    window.print(); // Trigger the print dialog
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe,
    private router: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.suggestions = [];
    this.noStockAlert = [];
    this.showCreateNewMedicineLink = [];
    this.invoiceNumber = this.router.snapshot.paramMap.get('id');

    this.http.getInvoiceById(this.invoiceNumber).subscribe((res: any) => {
      this.clickedGSTlink = res['gstAdded'];
      if (this.clickedGSTlink == null) {
        this.clickedGSTlink = false;
      }
      if (this.clickedGSTlink) {
        this.gstAmount = (res['total'] * this.gstRate) / 100;
        this.invoiceForm = this.fb.group({
          patientName: [res['patientName'], Validators.required],
          patientAddress: [res['patientAddress'], Validators.required],
          pid: [res['pid'], Validators.required],
          title: res['title'],
          gender: res['gender'],
          fatherName: res['fatherName'],
          consultantName: [res['consultantName'], Validators.required],
          paymentType: [res['paymentType'], Validators.required],
          paymentStatus: [res['paymentStatus'], Validators.required],
          invoiceID: [res['invoiceID'], Validators.required],
          invoiceDate: this.convertToISODate(res['invoiceDate']),
          grandTotalWithGST: res['grandTotalWithGST'],
          total: res['total'],
          gstAdded: res['gstAdded'],
          items: this.fb.array([]), // FormArray for invoice items
        });
        this.initializeItems(res['items']);
      } else {
        this.gstAmount = (res['total'] * this.gstRate) / 100;
        this.invoiceForm = this.fb.group({
          patientName: [res['patientName'], Validators.required],
          patientAddress: [res['patientAddress'], Validators.required],
          pid: [res['pid'], Validators.required],
          title: res['title'],
          gender: res['gender'],
          fatherName: res['fatherName'],
          consultantName: [res['consultantName'], Validators.required],
          paymentType: [res['paymentType'], Validators.required],
          paymentStatus: [res['paymentStatus'], Validators.required],
          invoiceID: [res['invoiceID'], Validators.required],
          invoiceDate: this.convertToISODate(res['invoiceDate']),
          grandTotalWithGST: res['total'],
          total: res['total'],
          gstAdded: res['gstAdded'],
          items: this.fb.array([]), // FormArray for invoice items
        });
        this.initializeItems(res['items']);
      }
    });

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
      items: this.fb.array([]),
      gstAdded: [''],
    });
    this.loadData();
    this.getAllDoctor();
    this.items.valueChanges.subscribe(() => this.calculateTotals());
    this.getAllInvoicesForToday();
    this.formattedDate = this.selectedDate?.toISOString(); // Convert date to ISO string format

    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('editInvoiceyId', this.invoiceNumber);
    }
  }

  groupedInvoicesByToday: any = [];
  groupedInvoicesBySpecificDate: any = [];

  // getAllInvoices
  getAllInvoicesForToday() {
    this.http.getAllInvoices().subscribe((res) => {
      this.invoiceData = res as any;
      this.itemsData = res as any;
      this.totalNumberOfEntries = this.invoiceData.length;
    });
  }

  getAllDoctor() {
    this.http.getAllDoctors().subscribe((res) => {
      this.doctorData = res as any;
    });
  }

  searchByDate() {
    this.formattedDate = this.selectedDate?.toISOString();
    this.http.getInvoiceDate(this.formattedDate).subscribe((res: any) => {
      this.groupedInvoicesBySpecificDate = res as any;
      this.totalNumberOfEntriesForSpecific =
        this.groupedInvoicesBySpecificDate.length;
    });
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
      medicineName: [''],
      price: [''],
      batch: [''],
      quantity: [''],
      expiryDate: [''],
      mid: [''],
      total: [''],
      mrp: [''],
      sgst: [''],
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
    this.addGST();
  }

  addItem(item: any) {
    const itemFormGroup = this.fb.group({
      medicineName: item.medicineName,
      price: item.price,
      batch: item.batch,
      quantity: item.quantity,
      expiryDate: item.expiryDate,
      mid: item.mid,
      total: item.total,
      mrp: item.price,
      sgst: item.sgst,
    });
    this.items.push(itemFormGroup);
    this.calculateTotals(); // Recalculate totals whenever an item is added
  }

  handleKeyDown(event: KeyboardEvent, index: number): void {
    // Ensure suggestions[index] is always an array
    if (!this.suggestions[index] || !Array.isArray(this.suggestions[index])) {
      this.suggestions[index] = []; // Initialize as an empty array if it's not
    }
    const suggestions = this.suggestions[index];

    if (suggestions && suggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedSuggestionIndex =
          (this.selectedSuggestionIndex + 1) % suggestions.length; // Move down
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedSuggestionIndex =
          (this.selectedSuggestionIndex - 1 + suggestions.length) %
          suggestions.length; // Move up
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const selectedMedicine =
          this.selectedSuggestionIndex >= 0
            ? suggestions[this.selectedSuggestionIndex]
            : suggestions[0]; // Default to the first suggestion if none is highlighted

        if (selectedMedicine) {
          this.onSelectMedicine(selectedMedicine, index); // Select the suggestion

          // Clear suggestions and reset index after selection
          this.suggestions[index] = [];
          this.selectedSuggestionIndex = -1; // Reset selected suggestion index
        }

        // Clear the input field if needed
        (event.target as HTMLInputElement).blur(); // Blur input to prevent re-triggering
      }
    }
  }
  // Handle the search (Autocomplete) for a specific row
  onSearch(event: KeyboardEvent, index: number) {
    const query = (event.target as HTMLInputElement).value;

    // Ensure suggestions[index] is initialized as an array
    if (!this.suggestions[index] || !Array.isArray(this.suggestions[index])) {
      this.suggestions[index] = [];
    }

    if (query.length > 2) {
      this.http.getProductByName(query).subscribe(
        (res) => {
          this.suggestions[index] = res as any;
          // Manage create link visibility
          this.showCreateNewMedicineLink[index] =
            this.suggestions[index].length === 0;
        },
        (error) => {
          console.error('Search error:', error);
          this.showCreateNewMedicineLink[index] =
            this.suggestions[index].length === 0;
        }
      );
    } else {
      this.suggestions[index] = []; // Clear suggestions if query is too short
    }
  }

  onSelectMedicine(medicine: any, index: number) {
    if (!Array.isArray(this.suggestions[index])) {
      this.suggestions[index] = [];
    }

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

    // Clear suggestions after selecting the medicine
    this.suggestions[index] = [];
    this.showCreateNewMedicineLink[index] = false;
    this.selectedSuggestionIndex = -1;
  }
  checkQuantity(medicineQuantity: any, index: any) {
    this.noStockAlert[index] = medicineQuantity <= 0; // Set alert for the current row
  }

  deleteItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
    // this.calculateTotal();
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
    const sgst = item.get('sgst')?.value || 0;
    const total = price * quantity;
    const gst = (total * sgst) / 100;
    const totalAddingSgst = total + gst;
    this.setItemTotal(item, totalAddingSgst);
    this.clickedGSTlink = false;
  }

  setItemTotal(i: any, total: any) {
    i.patchValue({ total: total });
  }

  calculateTotals() {
    if (this.clickedGSTlink) {
      let totalWithoutGST: number = 0;
      let totalWithGST: number = 0;
      this.items.controls.forEach((itemFormGroup) => {
        const totalPrice = itemFormGroup.get('total')?.value | 0;
        totalWithoutGST += totalPrice;
        this.total = totalPrice;
      });
      const gstRate = 0.18;

      totalWithGST = totalWithoutGST * (1 + gstRate);
      this.grandTotalWithGst = +totalWithGST.toFixed(2);
      this.invoiceForm
        .get('grandTotalWithGST')
        ?.patchValue(+totalWithGST.toFixed(2));
      this.invoiceForm.get('total')?.patchValue(+totalWithGST.toFixed(2));
    } else {
      let totalWithoutGST: number = 0;
      this.items.controls.forEach((itemFormGroup) => {
        const totalPrice = itemFormGroup.get('total')?.value | 0;
        totalWithoutGST += totalPrice;
        this.total = totalPrice;
      });
      this.invoiceForm
        .get('grandTotalWithGST')
        ?.patchValue(totalWithoutGST.toFixed(2));
      this.invoiceForm.get('total')?.patchValue(totalWithoutGST.toFixed(2));
      this.grandTotalWithOutGst = +totalWithoutGST.toFixed(2);
    }
  }

  onSearchPatientName(query: string) {
    if (query.length > 2) {
      this.http.getPatientByName(query).subscribe(
        (res) => {
          this.suggestionsPatientName = res as any;

          // Update link visibility based on response length
          this.updateCreateNewPatientLink();
        },
        (error) => {
          console.error('Search error:', error);
          this.suggestionsPatientName = []; // Clear suggestions on error
          this.updateCreateNewPatientLink(); // Ensure link is updated
        }
      );
    } else {
      // Clear suggestions if the query is too short
      this.suggestionsPatientName = [];
      this.updateCreateNewPatientLink(); // Ensure link is hidden
    }
  }
  private updateCreateNewPatientLink() {
    this.showCreateNewPatientLink = this.suggestionsPatientName.length === 0;
  }
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement; // Cast event.target to HTMLInputElement
    this.onSearchPatientName(input.value); //
  }
  handlePatientNameKeyDown(event: KeyboardEvent) {
    if (this.suggestionsPatientName.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedPatientIndex =
          (this.selectedPatientIndex + 1) % this.suggestionsPatientName.length;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedPatientIndex =
          (this.selectedPatientIndex - 1 + this.suggestionsPatientName.length) %
          this.suggestionsPatientName.length;
      } else if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        if (this.selectedPatientIndex >= 0) {
          const selectedPatient =
            this.suggestionsPatientName[this.selectedPatientIndex];
          this.onSelectPatientName(selectedPatient);
        } else if (this.suggestionsPatientName.length > 0) {
          // If no specific selection, select the first suggestion
          this.onSelectPatientName(this.suggestionsPatientName[0]);
        }
      }
    } else if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission if no suggestions
      this.showCreateNewPatientLink = false; // Hide the link if no suggestions are available
    }
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

    // Clear the suggestions array after selection
    this.suggestionsPatientName = [];
    this.selectedPatientIndex = -1; // Reset index after selection

    // Hide the "Create New Patient" link
    this.showCreateNewPatientLink = false;
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
          medicineName: item.medicineName,
          price: item.price,
          mid: item.mid,
          batch: item.batch,
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          mrp: item.price,
          sgst: item.sgst,
          total: item.total,
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

  formatDate(date: string): string {
    let dateObj = new Date(date);
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  updateInvoice() {
    this.invoiceForm.patchValue({
      invoiceID: this.invoiceForm.value.invoiceID,
      invoiceDate: this.invoiceForm.value.invoiceDate,
    });

    this.invoiceForm.patchValue({
      gstAdded: this.clickedGSTlink,
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
            this.loadData();
          },
          (err) => {
            console.log(err);
          }
        ),
      1000
    );
  }

  //delete patient by id
  deleteMedicineById(id: any) {
    sessionStorage.setItem('deleteInvoiceById', id);
  }
  removeSessionID() {
    sessionStorage.removeItem('editInvoiceyId');
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
            this.showDeleteProgressBar = false;
            this.loadData();
            sessionStorage.removeItem('deleteInvoiceById');
          },
          (err) => {
            console.log(err.message);
          }
        );
    }, 3000);
  }

  addGST() {
    let totalWithoutGST: number = 0;
    let totalWithGST: number = 0;
    this.items.controls.forEach((itemFormGroup) => {
      const totalPrice = itemFormGroup.get('total')?.value | 0;
      totalWithoutGST += totalPrice;
      this.total = totalPrice;
    });
    this.gstAmount = (totalWithoutGST * this.gstRate) / 100;
    const gstRate = 0.18;
    totalWithGST = totalWithoutGST * (1 + gstRate);
    this.grandTotalWithGst = +totalWithGST.toFixed(2);
    this.grandTotalWithOutGst = +totalWithoutGST.toFixed(2);

    this.invoiceForm
      .get('grandTotalWithGST')
      ?.patchValue(this.grandTotalWithGst);
    this.invoiceForm.get('total')?.patchValue(totalWithoutGST);
    this.clickedGSTlink = true;
  }

  removeGST() {
    let totalWithoutGST: number = 0;
    let totalWithGST: number = 0;
    this.items.controls.forEach((itemFormGroup) => {
      const totalPrice = itemFormGroup.get('total')?.value | 0;
      totalWithoutGST += totalPrice;
      this.total = totalPrice;
    });
    const gstRate = 0.18;

    totalWithGST = totalWithoutGST * (1 + gstRate);
    this.grandTotalWithGst = +totalWithGST.toFixed(2);
    this.grandTotalWithOutGst = +totalWithoutGST.toFixed(2);
    this.invoiceForm
      .get('grandTotalWithGST')
      ?.patchValue(this.grandTotalWithOutGst);
    this.invoiceForm.get('total')?.patchValue(totalWithoutGST);
    this.clickedGSTlink = false;
  }

  calculateTotal() {
    this.total = this.items.controls.reduce((acc, item) => {
      const total = item.get('total')?.value || 0;
      return acc + total;
    }, 0);
    this.gstAmount = (this.total * this.gstRate) / 100;
    this.grandTotalWithGst = this.total + this.gstAmount;
    this.grandTotalWithOutGst = this.total;
    this.addGST();
  }

  updateTotal(itemForm: FormGroup) {
    // this.clickedGSTlink = false;
    const price = itemForm.get('price')?.value || 0;
    const quantity = itemForm.get('quantity')?.value || 0;
    const sgst = itemForm.get('sgst')?.value || 0;
    const total = price * quantity;
    const gst = (total * sgst) / 100;
    const totalAddingSgst = total + gst;
    itemForm.get('total')?.patchValue(totalAddingSgst); // Update total without emitting valueChanges
    this.calculateTotal();
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
}
