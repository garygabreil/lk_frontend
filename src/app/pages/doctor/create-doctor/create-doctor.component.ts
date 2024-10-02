import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { DatePipe } from '@angular/common';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-create-doctor',
  templateUrl: './create-doctor.component.html',
  styleUrl: './create-doctor.component.css',
})
export class CreateDoctorComponent {
  doctorForm: FormGroup;
  showProgressBar: any;
  showAlert: any;
  showExistAlert: any;

  currentDate: string;
  uniquePid = Math.floor(100000 + Math.random() * 900000);
  private isCtrlSPressed = false; // Flag to prevent multiple triggers
  private isCtrlNPressed = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe
  ) {
    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';

    this.doctorForm = this.fb.group({
      title: [null, [Validators.required]],
      consultantName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      speciality: ['', [Validators.required]],
      address: ['', [Validators.required]],
      pid: [this.uniquePid, [Validators.required]],
      createdOn: [''],
      updatedOn: [''],
      createdBy: [''],
      updatedBy: [''],
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
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

  // Listen for the keyup event to reset the flag when keys are released
  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control' || event.key === 's') {
      this.isCtrlSPressed = false; // Reset the flag when either key is released
    }
    if (event.key === 'Control' || event.key === 'n') {
      this.isCtrlNPressed = false; // Reset the flag when either key is released
    }
  }
  onSubmit() {
    this.showProgressBar = true;

    setTimeout(
      () =>
        this.http
          .createDoctor({
            title: this.doctorForm.value.title,
            consultantName: this.doctorForm.value.consultantName,
            phone: this.doctorForm.value.phone,
            speciality: this.doctorForm.value.speciality,
            address: this.doctorForm.value.address,
            pid: this.doctorForm.value.pid,
            createdBy: sessionStorage.getItem('user'),
            createdOn: this.currentDate,
          })
          .subscribe(
            (res) => {
              this.showProgressBar = true;
              this.showAlert = true;
              this.showProgressBar = false;
              this.doctorForm.reset();
            },
            (err) => {
              this.doctorForm.reset();
              this.showProgressBar = true;
              this.showExistAlert = true;
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
