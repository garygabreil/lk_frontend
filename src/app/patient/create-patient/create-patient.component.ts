import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-create-patient',
  templateUrl: './create-patient.component.html',
  styleUrl: './create-patient.component.css',
})
export class CreatePatientComponent {
  patientForm: FormGroup;
  showProgressBar: any;
  showAlert: any;
  showExistAlert: any;

  uniquePid = Math.floor(100000 + Math.random() * 900000);
  formattedDate: any;
  currentDate: string;

  doctorData: any;
  appointmentId = Math.floor(100000 + Math.random() * 900000);
  backRouterURL: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe
  ) {
    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';

    this.patientForm = this.fb.group({
      title: [null, [Validators.required]],
      patientName: ['', [Validators.required]],
      gender: [null, [Validators.required]],
      patientPhoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
      patientAddress: ['', [Validators.required]],
      fatherName: ['', [Validators.required]],
      visitDate: ['', [Validators.required]],
      pid: [this.uniquePid, [Validators.required]],
      consultantName: [null, Validators.required],
      createdOn: [''],
      updatedOn: [''],
      createdBy: [''],
      updatedBy: [''],
      age: ['', [Validators.required]],
      type: [null, [Validators.required]],
      symptoms: ['', [Validators.required]],
      medicinesPrescribed: [''],
      remarks: [''],
      paymentType: [''],
      paymentStatus: [''],
      nextVisit: [''],
      bp: [''],
      sp02: [''],
      pulse: [''],
      sugar: [''],
      appointmentId: [this.appointmentId, [Validators.required]],
    });
    this.getAllDoctor();
  }

  getLocations() {
    if (sessionStorage.getItem('locations') == 'pharmarcy') {
      this.backRouterURL = 'create-bill';
    }
  }

  //date formatter
  formatDate(date: string): string {
    let dateObj = new Date(date);
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getAllDoctor() {
    this.http.getAllDoctors().subscribe((res) => {
      this.doctorData = res as any;
    });
  }

  onSubmit() {
    this.showProgressBar = true;
    setTimeout(
      () =>
        this.http
          .createPatient({
            patientName: this.patientForm.value.patientName,
            patientPhoneNumber: this.patientForm.value.patientPhoneNumber,
            patientAddress: this.patientForm.value.patientAddress,
            title: this.patientForm.value.title,
            gender: this.patientForm.value.gender,
            fatherName: this.patientForm.value.fatherName,
            visitDate: (this.formattedDate = this.formatDate(
              this.patientForm.value.visitDate
            )),
            pid: this.patientForm.value.pid,
            consultantName: this.patientForm.value.consultantName,
            createdOn: this.currentDate,
            updatedOn: null,
            createdBy: sessionStorage.getItem('user'),
            updatedBy: null,
            age: this.patientForm.value.age,
            type: this.patientForm.value.type,
            symptoms: this.patientForm.value.symptoms,
            medicinesPrescribed: this.patientForm.value.medicinesPrescribed,
            remarks: this.patientForm.value.remarks,
            paymentType: this.patientForm.value.paymentType,
            paymentStatus: this.patientForm.value.paymentStatus,
            nextVisit: this.patientForm.value.nextVisit,
            bp: this.patientForm.value.bp,
            sp02: this.patientForm.value.sp02,
            pulse: this.patientForm.value.pulse,
            sugar: this.patientForm.value.sugar,
            appointmentId: this.patientForm.value.appointmentId,
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
