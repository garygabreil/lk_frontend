import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-view-individual-po-invoices',
  templateUrl: './view-individual-po-invoices.component.html',
  styleUrl: './view-individual-po-invoices.component.css',
})
export class ViewIndividualPoInvoicesComponent {
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
  private isPrinting: boolean = false;
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
    this.isPrinting = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault(); // Prevent the default save dialog
      this.updateInvoice(); // Call the method to save
    } else if (event.ctrlKey && event.key === 'p') {
      event.preventDefault(); // Prevent the default print action
      if (!this.isPrinting) {
        this.isPrinting = true;
        this.triggerPrint();
      }
    }
  }
  // Ensure print is triggered only once
  triggerPrint(): void {
    setTimeout(() => {
      window.print();
      this.resetPrintFlag();
    }, 500); // Slight delay to ensure page is fully rendered before print
  }

  // Reset the flag after printing is done
  resetPrintFlag(): void {
    setTimeout(() => {
      this.isPrinting = false;
    }, 1000); // Reset after 1 second to allow future prints
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe,
    private router: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private routerUrl: Router
  ) {
    this.isPrinting = false;
    this.suggestions = [];
    this.noStockAlert = [];
    this.showCreateNewMedicineLink = [];
    this.invoiceNumber = this.router.snapshot.paramMap.get('id');

    this.http.getInvoiceByPoId(this.invoiceNumber).subscribe((res: any) => {
      this.clickedGSTlink = res['gstAdded'];
      if (this.clickedGSTlink == null) {
        this.clickedGSTlink = false;
      }
      if (this.clickedGSTlink) {
        this.gstAmount = (res['total'] * this.gstRate) / 100;
        this.invoiceForm = this.fb.group({
          supplierName: [res['supplierName'], Validators.required],
          supplierPhoneNumber: [
            res['supplierPhoneNumber'],
            Validators.required,
          ],
          supplierAddress: [res['supplierAddress'], Validators.required],
          paymentType: [res['paymentType'], Validators.required],
          paymentStatus: [res['paymentStatus'], Validators.required],
          invoiceID: [res['invoiceID'], Validators.required],
          invoiceDate: this.convertToISODate(res['invoiceDate']),
          grandTotalWithGST: res['grandTotalWithGST'],
          total: res['total'],
          gstAdded: res['gstAdded'],
          items: this.fb.array([]), // FormArray for invoice items
          createdBy: [res['createdBy']],
        });
        this.initializeItems(res['items']);
      } else {
        this.gstAmount = (res['total'] * this.gstRate) / 100;
        this.invoiceForm = this.fb.group({
          supplierName: [res['supplierName'], Validators.required],
          supplierPhoneNumber: [
            res['supplierPhoneNumber'],
            Validators.required,
          ],
          supplierAddress: [res['supplierAddress'], Validators.required],
          patientName: [res['patientName'], Validators.required],
          patientAddress: [res['patientAddress'], Validators.required],
          paymentType: [res['paymentType'], Validators.required],
          paymentStatus: [res['paymentStatus'], Validators.required],
          invoiceID: [res['invoiceID'], Validators.required],
          invoiceDate: this.convertToISODate(res['invoiceDate']),
          grandTotalWithGST: res['total'],
          total: res['total'],
          gstAdded: res['gstAdded'],
          items: this.fb.array([]), // FormArray for invoice items
          createdBy: [res['createdBy']],
        });
        this.initializeItems(res['items']);
      }
    });

    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';

    this.invoiceForm = this.fb.group({
      supplierName: [''],
      supplierPhoneNumber: [''],
      supplierAddress: [''],
      paymentType: [''],
      paymentStatus: [''],
      invoiceID: [''],
      invoiceDate: [''],
      grandTotalWithGST: [''],
      total: [''],
      gstAdded: [''],
      items: this.fb.array([]), // FormArray for invoice items
      createdBy: [''],
      grandTotalWithOutGST: [''],
      updatedBy: [],
      updatedOn: [],
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
    this.http.getAllPoInvoices().subscribe((res) => {
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
    this.http.getAllPoInvoices().subscribe((res) => {
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
    if (!this.suggestions[index] || !Array.isArray(this.suggestions[index])) {
      this.suggestions[index] = []; // Initialize as an empty array if it's not
    }

    const suggestions = this.suggestions[index];

    if (suggestions && suggestions.length > 0) {
      // Handle Arrow navigation and Enter key for suggestions
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
    } else if (event.key === 'Enter' && this.showCreateNewMedicineLink[index]) {
      // If there are no suggestions and the Enter key is pressed, navigate to "Create Medicine"
      event.preventDefault();
      this.routerUrl.navigate(['/create-medicine']); // Navigate to the medicine creation page
    }
  }
  // Handle the search (Autocomplete) for a specific row
  onSearch(event: KeyboardEvent, index: number) {
    const query = (event.target as HTMLInputElement).value.trim();

    // Ensure suggestions[index] is initialized as an array
    if (!this.suggestions[index] || !Array.isArray(this.suggestions[index])) {
      this.suggestions[index] = [];
    }

    if (query.length > 2) {
      this.http.getProductByName(query).subscribe(
        (res: any) => {
          // Filter suggestions to include only those starting with or closely matching the query
          this.suggestions[index] = res.filter((medicine: any) =>
            medicine.medicineName.toLowerCase().startsWith(query.toLowerCase())
          );

          // Manage "Create New Medicine" link visibility based on suggestions
          this.showCreateNewMedicineLink[index] =
            this.suggestions[index].length === 0;
        },
        (error) => {
          console.error('Search error:', error);
          this.suggestions[index] = [];
          this.showCreateNewMedicineLink[index] = true; // Show "Create Medicine" if there's an error
        }
      );
    } else {
      this.suggestions[index] = []; // Clear suggestions if the query is too short
      this.showCreateNewMedicineLink[index] = false; // Hide "Create Medicine" if query is too short
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
    this.calculateTotal();
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

  patientNameQuery: any;
  onSearchPatientName(query: string) {
    this.patientNameQuery = query;
    if (this.patientNameQuery.length > 2) {
      // Ensure minimum 3 characters for search
      this.http.getProductBySupplierName(query).subscribe(
        (res) => {
          this.suggestionsPatientName = res as any;
          this.updateCreateNewPatientLink(this.patientNameQuery); // Check if we need to show the "Create New Patient" link
        },
        (error) => {
          console.error('Search error:', error);
          this.suggestionsPatientName = []; // Clear suggestions on error
          this.updateCreateNewPatientLink(this.patientNameQuery); // Ensure link is updated on error
        }
      );
    } else {
      // Clear suggestions and hide the "Create New Patient" link if less than 3 characters
      this.suggestionsPatientName = [];
      this.showCreateNewPatientLink = false; // Ensure the link is hidden when query is too short
    }
  }
  private updateCreateNewPatientLink(query: any) {
    this.showCreateNewPatientLink =
      this.suggestionsPatientName.length === 0 &&
      this.patientNameQuery.length > 2;
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement; // Cast event.target to HTMLInputElement
    this.patientNameQuery = input.value; // Store query in a class variable for further use
    this.onSearchPatientName(input.value); // Trigger search based on input value
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
    } else if (event.key === 'Enter' && this.showCreateNewPatientLink) {
      event.preventDefault(); // Prevent default form submission
      this.goToPatient(); // Trigger the create new patient functionality
    }
  }

  onSelectPatientName(res: any) {
    this.invoiceForm.patchValue({
      supplierName: res.supplierName,
      supplierAddress: res.supplierAddress,
      supplierPhoneNumber: res.supplierPhone,
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
      updatedBy: sessionStorage.getItem('user'),
      updatedOn: this.convertToISODate(this.currentDate),
    });

    this.invoiceForm.patchValue({
      gstAdded: this.clickedGSTlink,
    });
    this.showProgressBar = true;
    let id = sessionStorage.getItem('editInvoiceyId');
    console.log(this.invoiceForm.value);
    setTimeout(
      () =>
        this.http.updateInvoiceByPoId(id, this.invoiceForm.value).subscribe(
          (res) => {
            this.showProgressBar = true;
            this.showAlert = true;
            setTimeout(() => (this.showAlert = false), 3000);
            this.showProgressBar = false;
            this.loadData();
            this.inventoryCheck(this.items.value);
          },
          (err) => {
            console.log(err);
          }
        ),
      1000
    );
  }
  inventoryCheck(ar: any) {
    this.http.updateQuantity(ar).subscribe((res) => {});
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
        .deleteInvoiceByPoId(sessionStorage.getItem('deleteInvoiceById'))
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
  goToPatient() {
    this.routerUrl.navigateByUrl('/create-medicine');
  }
}
