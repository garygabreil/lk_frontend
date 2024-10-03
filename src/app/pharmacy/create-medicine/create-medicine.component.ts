import { DatePipe } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-create-medicine',
  templateUrl: './create-medicine.component.html',
  styleUrl: './create-medicine.component.css',
})
export class CreateMedicineComponent {
  pharmacyForm: FormGroup;
  showProgressBar: any;
  showAlert: any;
  currentDate: any;
  showExistAlert: any;
  midUniqueID: any;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  private isCtrlSPressed = false; // Flag to prevent multiple triggers
  private isCtrlNPressed = false;

  selectedSuggestionIndex: number = -1; // Initialize to -1 for no selection
  selectedPatientIndex: number = -1;
  suggestionsPatientName: any[] = []; // Ensure this is initialized properly
  patientNameQuery: any;

  selectedMedIndex: number = -1;
  suggestionsMedName: any[] = [];
  MedNameQuery: any;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private http: HttpService
  ) {
    this.generateUniqueNumber();
    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';
    this.pharmacyForm = this.fb.group({
      medicineName: [''],
      batch: [''],
      expiryDate: [''],
      price: [0],
      quantity: [0],
      hsn_code: [''],
      sgst: [0],
      pack: [],
      createdAt: [''],
      createdBy: [''],
      updatedBy: [''],
      updatedOn: [''],
      supplierName: [''],
      supplierAddress: [''],
      supplierPhone: [],
      mid: [''],
    });
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's' && !this.isCtrlSPressed) {
      event.preventDefault(); // Prevent the browser's default behavior
      this.isCtrlSPressed = true; // Set the flag to true
      this.createMedicine(); // Call your save method
    }
    if (event.ctrlKey && event.key === 'n' && !this.isCtrlNPressed) {
      event.preventDefault(); // Prevent the browser's default behavior
      this.isCtrlNPressed = true; // Set the flag to true
      this.refresh(); // Call your save method
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control' || event.key === 's') {
      this.isCtrlSPressed = false; // Reset the flag when either key is released
    }
    if (event.key === 'Control' || event.key === 'n') {
      this.isCtrlNPressed = false; // Reset the flag when either key is released
    }
  }
  price: number = 0; // Default price value

  get formattedPrice(): string {
    return this.price.toFixed(2); // Formats the number to always show 2 decimals
  }

  // Parse input value and format it correctly
  onPriceChange(event: any) {
    const value = parseFloat(event.target.value);
    this.price = isNaN(value) ? 0 : parseFloat(value.toFixed(2)); // Ensure the input is a valid number with 2 decimals
  }

  calculatePerQun() {
    this.pharmacyForm.patchValue({
      priceOfOne:
        this.pharmacyForm.value.quantity / this.pharmacyForm.value.price,
    });
  }

  createMedicine() {
    this.pharmacyForm.patchValue({
      createdAt: this.currentDate,
      createdBy: sessionStorage.getItem('user'),
      expiryDate: this.formatDate(this.pharmacyForm.value.expiryDate),
    });

    this.showProgressBar = true;
    setTimeout(() => {
      this.http.createProduct(this.pharmacyForm.value).subscribe(
        (res) => {
          this.showProgressBar = true;
          this.showAlert = true;
          this.showProgressBar = false;
          this.pharmacyForm.reset();
          this.generateUniqueNumber();
        },
        (err) => {
          this.showProgressBar = true;
          this.showExistAlert = true;
          this.pharmacyForm.reset();
          this.showExistAlert = err.status;
          this.showProgressBar = false;
          this.generateUniqueNumber();
        }
      );
    }, 1000);
  }

  //date formatter
  formatDate(date: string): string {
    let dateObj = new Date(date);
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async generateUniqueNumber() {
    this.midUniqueID = await Math.floor(100000 + Math.random() * 900000);
    this.pharmacyForm.patchValue({
      mid: this.midUniqueID,
    });
  }

  monthYearValidator(control: any) {
    const validFormat = /^(0[1-9]|1[0-2])\/\d{4}$/; // MM/YYYY format
    return validFormat.test(control.value) ? null : { invalidFormat: true };
  }

  refresh() {
    window.location.reload();
  }

  onSearchMedName(query: string) {
    this.MedNameQuery = query;
    if (this.MedNameQuery.length > 2) {
      // Ensure minimum 3 characters for search
      this.http.getProductByName(query).subscribe(
        (res) => {
          this.suggestionsMedName = res as any;
        },
        (error) => {
          console.error('Search error:', error);
          this.suggestionsMedName = []; // Clear suggestions on error
        }
      );
    } else {
      // Clear suggestions and hide the "Create New Patient" link if less than 3 characters
      this.suggestionsPatientName = [];
    }
  }

  onInputChangeMed(event: Event) {
    const input = event.target as HTMLInputElement; // Cast event.target to HTMLInputElement
    this.MedNameQuery = input.value; // Store query in a class variable for further use
    this.onSearchMedName(input.value); // Trigger search based on input value
  }

  handleMedNameKeyDown(event: KeyboardEvent) {
    if (this.suggestionsMedName.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedMedIndex =
          (this.selectedMedIndex + 1) % this.suggestionsMedName.length;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedMedIndex =
          (this.selectedMedIndex - 1 + this.suggestionsMedName.length) %
          this.suggestionsMedName.length;
      } else if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        if (this.selectedMedIndex >= 0) {
          const selectedMed = this.suggestionsMedName[this.selectedMedIndex];
          this.onSelectMedName(selectedMed);
        } else if (this.suggestionsMedName.length > 0) {
          // If no specific selection, select the first suggestion
          this.onSelectMedName(this.suggestionsMedName[0]);
        }
      }
    } else if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission
    }
  }

  onSelectMedName(res: any) {
    this.pharmacyForm.patchValue({
      medicineName: res.medicineName,
      batch: res.batch,
      hsn_code: res.hsn_code,
      sgst: res.sgst,
    });

    // Clear the suggestions array after selection
    this.suggestionsMedName = [];
    this.selectedMedIndex = -1; // Reset index after selection

    // Hide the "Create New Patient" link
  }

  //medicine
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
    }
  }
  private updateCreateNewPatientLink(query: any) {
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
    } else if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission
    }
  }

  onSelectPatientName(res: any) {
    this.pharmacyForm.patchValue({
      supplierName: res.supplierName,
      supplierAddress: res.supplierAddress,
      supplierPhoneNumber: res.supplierPhone,
    });

    // Clear the suggestions array after selection
    this.suggestionsPatientName = [];
    this.selectedPatientIndex = -1; // Reset index after selection

    // Hide the "Create New Patient" link
  }
}
