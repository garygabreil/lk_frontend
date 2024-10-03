import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pharmacy-patient-creation',
  templateUrl: './pharmacy-patient-creation.component.html',
  styleUrl: './pharmacy-patient-creation.component.css',
})
export class PharmacyPatientCreationComponent {
  patientForm: FormGroup;
  showProgressBar: any;
  doctorData: any;
  uniquePid = Math.floor(100000 + Math.random() * 900000);
  currentDate: string;
  showAlert: any;
  showExistAlert: any;
  private isCtrlSPressed = false; // Flag to prevent multiple triggers
  private isCtrlNPressed = false;

  formattedDate: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe
  ) {
    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';

    this.patientForm = this.fb.group({
      title: [null],
      patientName: ['', [Validators.required]],
      gender: [],
      patientPhoneNumber: [''],
      patientAddress: [''],
      fatherName: [''],
      visitDate: [''],
      pid: [this.uniquePid, [Validators.required]],
      consultantName: [null, Validators.required],
      createdOn: [''],
      updatedOn: [''],
      createdBy: [''],
      updatedBy: [''],
      age: ['', [Validators.required]],
      type: [],
      symptoms: [],
      medicinesPrescribed: [''],
      remarks: [''],
      paymentType: [''],
      paymentStatus: [''],
      nextVisit: [''],
      bp: [''],
      sp02: [''],
      pulse: [''],
      sugar: [''],
      appointmentId: [],
    });
    this.getAllDoctor();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's' && !this.isCtrlSPressed) {
      event.preventDefault(); // Prevent the browser's default behavior
      this.isCtrlSPressed = true; // Set the flag to true
      this.onSubmit(); // Call your save method
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

  getAllDoctor() {
    this.http.getAllDoctors().subscribe((res) => {
      this.doctorData = res as any;
    });
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
    this.patientForm.patchValue({
      visitDate: formattedDate, // Set the current date to the input
    });
  }

  formatDate(date: string): string {
    let dateObj = new Date(date);
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onSubmit() {
    this.showProgressBar = true;
    setTimeout(
      () =>
        this.http
          .createPatient({
            patientName: this.patientForm.value.patientName,
            title: this.patientForm.value.title,
            visitDate: (this.formattedDate = this.formatDate(
              this.patientForm.value.visitDate
            )),
            pid: this.patientForm.value.pid,
            consultantName: this.patientForm.value.consultantName,
            createdOn: this.currentDate,
            createdBy: sessionStorage.getItem('user'),
            age: this.patientForm.value.age,
          })
          .subscribe(
            (res) => {
              this.showProgressBar = true;
              this.showAlert = true;
              this.showProgressBar = false;
              this.patientForm.patchValue({
                pid: this.uniquePid,
              });

              this.patientForm.reset();
            },
            (err) => {
              this.showProgressBar = true;
              this.showExistAlert = true;
              this.patientForm.patchValue({
                pid: this.uniquePid,
              });

              this.patientForm.reset();
              this.showExistAlert = err.status;
              this.showProgressBar = false;
            }
          ),
      1000
    );
  }

  refresh() {
    window.location.reload();
  }
}
