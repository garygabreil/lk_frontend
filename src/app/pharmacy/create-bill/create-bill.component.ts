import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ReminderService } from '../../services/reminder.service';
import { PrintServiceService } from '../../services/print-service.service';

@Component({
  selector: 'app-create-bill',
  templateUrl: './create-bill.component.html',
  styleUrl: './create-bill.component.css',
})
export class CreateBillComponent implements OnInit, OnDestroy {
  clickedGSTlink: boolean = false;
  private printTriggered: boolean = false; // Flag to track print state

  invoiceForm: FormGroup;
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
  showCreateNewPatientLink = false; // Start with the link hidden

  doctorData: any;
  disableSaveButton = false;
  noStockAlert: boolean[] = [];
  suggestions: any[][] = []; // Array of suggestions for each input
  currentInputIndex: number = 0; // Index of the current input
  selectedSuggestionIndex: number = -1; // Initialize to -1 for no selection
  selectedPatientIndex: number = -1;
  suggestionsPatientName: any[] = []; // Ensure this is initialized properly
  private isPrinting: boolean = false;
  showAlertForm: any;
  inventory: { [key: string]: number } = {}; // Store available quantities for each medicine
  previousQuantities: { [key: string]: number } = {}; // Track previous quantities
  medicineData: any[] = [];
  medicineReminders: { name: string; expiryDate: string; reminder: string }[] =
    [];
  reminderMessages: string[] = []; // Store reminder messages for scrolling

  ngOnInit() {
    // Add keydown event listener
    if (isPlatformBrowser(this.platformId)) {
      // Add keydown event listener
      document.addEventListener('keydown', this.handleKeyboardEvent.bind(this));
      this.printService.attachPrintListener();
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
    this.printService.removePrintListener();
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public reminderService: ReminderService,
    private printService: PrintServiceService
  ) {
    this.suggestions = [];

    this.noStockAlert = [];
    this.showCreateNewMedicineLink = [];
    this.invoiceForm = this.fb.group({
      patientName: ['', Validators.required],
      patientAddress: [''],
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
      createdBy: [sessionStorage.getItem('user')],
    });
    // Add one default item on load
    this.addItem();
    this.invoiceForm.valueChanges.subscribe((values) => {
      this.calculateTotal();
    });

    this.getAllDoctor();
    this.initializeSuggestions();
    this.isPrinting = false;
    this.loadDataMedicalData();
  }

  initializeSuggestions() {
    this.suggestions = Array(this.items.length)
      .fill(null)
      .map(() => []); // Adjust to the number of items
  }

  loadDataMedicalData() {
    this.http.getAllProducts().subscribe((res) => {
      this.medicineData = res as any;
      this.checkReminders();
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'n') {
      event.preventDefault(); // Prevent the default behavior (like opening a new tab)
      this.newInvoice(); // Call the method
    }
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault(); // Prevent the default save dialog
      if (this.invoiceForm.valid) {
        this.saveInvoice(); // Call the method to save
        return;
      } else {
        this.showAlertForm = true;
        setTimeout(() => {
          this.showAlertForm = false;
        }, 1000);
      }
    }
  }

  triggerPrint(): void {
    window.print();
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

  resetFormArray() {
    const itemsArray = this.invoiceForm.get('items') as FormArray;
    while (itemsArray.length !== 0) {
      itemsArray.removeAt(0); // Remove each FormGroup
    }
    // Optionally, you can also add a new empty FormGroup if needed
    this.addItem(); // Call a method to add a new empty item if desired
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
      quantity: [0],
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

    this.addGST();
    this.items.push(itemForm);
    this.suggestions.push([]); // Add an empty array for suggestions for the new row
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
      this.router.navigate(['/create-medicine']); // Navigate to the medicine creation page
    }
  }

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
  onSelectMedicine(medicine: any, index: number): void {
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

  patientNameQuery: any;
  onSearchPatientName(query: string) {
    this.patientNameQuery = query;
    if (this.patientNameQuery.length > 2) {
      // Ensure minimum 3 characters for search
      this.http.getPatientByName(query).subscribe(
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

  private isSaving: boolean = false; // Flag to prevent multiple saves

  saveInvoice() {
    if (this.isSaving) return; // Exit if already saving
    this.isSaving = true; // Set flag to prevent further calls
    this.createInvoice(); // Call the method to create invoice
    // Reset the flag after a timeout or when the operation is complete
    setTimeout(() => {
      this.isSaving = false; // Reset the flag
    }, 1000); // Adjust the timeout duration as needed
  }

  AlreadyInvoiceExist: any;
  createInvoice(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.invoiceForm.patchValue({
        grandTotalWithGST: this.grandTotalWithGst,
        total: this.total,
        grandTotalWithOutGst: this.grandTotalWithOutGst,
      });
      this.invoiceForm.patchValue({
        createdBy: sessionStorage.getItem('user'),
        createdOn: this.currentDate,
      });

      this.invoiceForm.patchValue({
        invoiceID: this.invoiceUniqueID,
        invoiceDate: this.invoiceForm.value.invoiceDate,
      });
      this.showProgressBar = true;
      setTimeout(
        () =>
          this.http
            .createInvoice(this.invoiceForm.value)
            .subscribe((res: any) => {
              this.showProgressBar = true;
              this.showAlert = true;
              this.showProgressBar = false;
              this.showWithoutGST = false;
              setTimeout(() => {
                this.showAlert = false;
              }, 500);
              this.inventoryCheck(this.items.value);
              this.disableSaveButton = true;
              this.printId = res['_id'];
            }),
        1000
      );
    });
  }

  newInvoice() {
    this.invoiceForm.reset();
    this.disableSaveButton = false;
    this.resetFormArray();
    this.generateUniqueNumber();
  }

  inventoryCheck(ar: any) {
    this.http.updateQuantity(ar).subscribe((res) => {});
  }
  pharmaPatientCreation() {
    sessionStorage.setItem('locationss', 'pharmarcy');
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default form submission if any
      this.setCurrentDate();
    }
  }

  setCurrentDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    this.invoiceForm.patchValue({
      invoiceDate: formattedDate, // Set the current date to the input
    });
  }
  showOptions: boolean = false;

  onKeyUp(event: KeyboardEvent) {
    // Check if the Enter key is pressed
    event.preventDefault(); // Prevent form submission
    this.toggleDropdown();
  }
  toggleDropdown() {
    // Simulate dropdown visibility (not all browsers may respond to this)
    const selectElement = document.querySelector(
      'select[formControlName="paymentType"]'
    ) as HTMLSelectElement;

    if (selectElement) {
      selectElement.focus(); // Ensure the select is focused
      selectElement.click(); // Simulate click to open the dropdown
    }
  }

  goToPatient() {
    this.router.navigateByUrl('/create-patient-pharmacy');
  }

  // reminder
  public checkReminders(): void {
    const now = new Date();
    this.medicineData.forEach((medicine) => {
      const expiryDateString = medicine.expiryDate; // Assuming expiryDate is in dd-mm-yyyy format
      const expiryDate = this.reminderService.parseDate(expiryDateString); // Now accessible

      // Check if expiryDate is valid before proceeding
      if (expiryDate) {
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
          name: medicine.medicineName,
          expiryDate: expiryDate.toLocaleDateString(),
          reminder: '',
        });
      } else {
      }
    });
  }
  getStatus(expiryDateString: string): string {
    const expiryDate = this.reminderService.parseDate(expiryDateString);

    // Check if expiryDate is valid
    if (!expiryDate) {
      return 'Invalid Date'; // or any other fallback status
    }

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
}
