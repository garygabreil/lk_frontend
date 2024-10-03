import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  groupedInvoicesBySpecificSearch: any;
  totalNumberOfEntriesForSpecificSearch: any;
  groupedInvoicesBySpecificDateSearch: any;

  medicineReminders: { name: string; expiryDate: string; reminder: string }[] =
    [];
  reminderMessages: string[] = []; // Store reminder messages for scrolling
  private isCtrlSPressed = false; // Flag to prevent multiple triggers

  suggestions: any = []; // Array of suggestions for each input
  selectedSuggestionIndex: number = -1; // Initialize to -1 for no selection
  showCreateNewMedicineLink: any;

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
      supplierName: [''],
    });

    this.pharmacyForm = this.fb.group({
      medicineName: [''],
      batch: [''],
      expiryDate: [''],
      price: [0],
      quantity: [0],
      hsn_code: [''],
      sgst: [''],
      createdAt: [''],
      createdBy: [''],
      updatedBy: [''],
      updatedOn: [''],
      mid: [''],
      pack: [''],
      supplierName: [''],
      supplierAddress: [''],
      supplierPhone: ['', [Validators.pattern('^[0-9]{10}$')]],
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
  convertToDateInputFormat(dateString: string): string | null {
    if (!dateString) return null;

    const [day, month, year] = dateString.split('-').map(Number); // Split and convert to numbers
    // Create Date object in UTC to avoid timezone issues
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString().split('T')[0]; // Convert to 'yyyy-mm-dd'
  }
  async editMedicineById(id: any) {
    await this.http.getProductById(id).subscribe((res: any) => {
      this.pharmacyForm = this.fb.group({
        medicineName: [res['medicineName']],
        price: [res['price']],
        quantity: [res['quantity']],
        hsn_code: [res['hsn_code']],
        batch: [res['batch']],
        pack: [res['pack']],
        mid: [res['mid']],
        expiryDate: [this.convertToDateInputFormat(res['expiryDate'])],
        createdAt: this.convertToISODate(res['createdAt']),
        createdBy: res['createdBy'],
        sgst: [res['sgst']],
        supplierName: [res['supplierName']],
        supplierAddress: [res['supplierAddress']],
        supplierPhone: [res['supplierPhone']],
      });
      sessionStorage.setItem('editMedicineById', id);
    });
  }
  //date formatter
  public convertToISODate(dateString: string): string | null {
    if (!dateString || typeof dateString !== 'string') {
      return null; // Return null or handle error appropriately
    }

    const [day, month, year] = dateString.split('-').map(Number);

    // Check if the parsed values are valid numbers
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null; // Return null if any component is invalid
    }

    // Create a new Date object and return the ISO string
    const date = new Date(year, month - 1, day); // Month is 0-based
    return date.toISOString(); // Return ISO string format
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
            pack: this.pharmacyForm.value.pack,
            priceOfOne: this.pharmacyForm.value.priceOfOne,
            updatedBy: sessionStorage.getItem('user'),
            updatedOn: this.convertToISODate(this.currentDate),
            mid: this.pharmacyForm.value.mid,
            supplierName: this.pharmacyForm.value.supplierName,
            supplierAddress: this.pharmacyForm.value.supplierAddress,
            supplierPhone: this.pharmacyForm.value.supplierPhone,
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

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's' && !this.isCtrlSPressed) {
      event.preventDefault(); // Prevent the browser's default behavior
      this.isCtrlSPressed = true; // Set the flag to true
      this.updateChanges(); // Call your save method
    }
  }

  handlePKeyDown(event: KeyboardEvent): void {
    if (!this.suggestions || !Array.isArray(this.suggestions)) {
      this.suggestions = []; // Initialize as an empty array if it's not
    }

    const suggestions = this.suggestions;

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
          this.onSelectMedicine(selectedMedicine); // Select the suggestion

          // Clear suggestions and reset index after selection
          this.suggestions = [];
          this.selectedSuggestionIndex = -1; // Reset selected suggestion index
        }
        // Clear the input field if needed
        (event.target as HTMLInputElement).blur(); // Blur input to prevent re-triggering
      }
    } else if (event.key === 'Enter' && this.showCreateNewMedicineLink) {
      // If there are no suggestions and the Enter key is pressed, navigate to "Create Medicine"
      event.preventDefault();
    }
  }

  // Listen for the keyup event to reset the flag when keys are released
  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control' || event.key === 's') {
      this.isCtrlSPressed = false; // Reset the flag when either key is released
    }
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

  handlMedKeyDown(event: KeyboardEvent, index: number): void {
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
          this.onSelectMedicine(selectedMedicine); // Select the suggestion

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

  onSearch(event: KeyboardEvent) {
    const query = (event.target as HTMLInputElement).value.trim();

    // Ensure suggestions[index] is initialized as an array
    if (!this.suggestions || !Array.isArray(this.suggestions)) {
      this.suggestions = [];
    }

    if (query.length > 2) {
      this.http.getProductByName(query).subscribe(
        (res: any) => {
          // Filter suggestions to include only those starting with or closely matching the query
          this.suggestions = res.filter((medicine: any) =>
            medicine.medicineName.toLowerCase().startsWith(query.toLowerCase())
          );

          // Manage "Create New Medicine" link visibility based on suggestions
          this.showCreateNewMedicineLink = this.suggestions.length === 0;
        },
        (error) => {
          console.error('Search error:', error);
          this.suggestions = [];
          this.showCreateNewMedicineLink = true; // Show "Create Medicine" if there's an error
        }
      );
    } else {
      this.suggestions = []; // Clear suggestions if the query is too short
      this.showCreateNewMedicineLink = false; // Hide "Create Medicine" if query is too short
    }
  }
  onSelectMedicine(medicine: any): void {
    this.searchForm.patchValue({
      medicineName: medicine.medicineName,
    });

    // Clear suggestions after selecting the medicine
    this.suggestions = [];
    this.showCreateNewMedicineLink = false;
    this.selectedSuggestionIndex = -1;
  }
  patientNameQuery: any;
  suggestionsPatientName: any[] = []; // Ensure this is initialized properly
  selectedPatientIndex: number = -1;
  showCreateNewPatientLink: any;

  onSearchPatientName() {
    this.patientNameQuery = this.searchForm.value.supplierName;
    if (this.patientNameQuery.length > 2) {
      // Ensure minimum 3 characters for search
      this.http.getProductBySupplierName(this.patientNameQuery).subscribe(
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

  searchBySpecific() {
    const searchCriteria = {
      medicineName: this.searchForm.value.medicineName,
      batch: this.searchForm.value.batch,
      hsn_code: this.searchForm.value.hsn_code,
      supplierName: this.searchForm.value.supplierName,
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
