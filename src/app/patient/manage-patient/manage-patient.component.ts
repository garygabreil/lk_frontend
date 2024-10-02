import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-manage-patient',
  templateUrl: './manage-patient.component.html',
  styleUrl: './manage-patient.component.css',
})
export class ManagePatientComponent {
  patientForm: FormGroup;
  private isCtrlSPressed = false; // Flag to prevent multiple triggers

  //progressbar
  showProgressBar: any;

  //patientData
  patientData: any[] = [];

  //search bar
  search: string = '';

  //pagination
  p: number = 1;

  //totalNumberOfEntries
  totalNumberOfEntries: any;

  // alert
  showAlert: any;

  //age
  age: any;

  //deleteProgress
  showDeleteProgressBar: any;

  //deleteAlert
  showDeleteAlert: any;

  //doctorData
  doctorData: any;

  //currentDate
  currentDate: string;

  @ViewChild('closeModal')
  closeModal!: ElementRef;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private cdr: ChangeDetectorRef,
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
      pid: ['', [Validators.required]],
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
      appointmentId: ['', [Validators.required]],
    });

    this.loadData();
    this.getAllDoctor();
  }

  loadData() {
    this.http.getAllPatient().subscribe((res) => {
      this.patientData = res as any;
      this.totalNumberOfEntries = this.patientData.length;
    });
  }

  //getDoctors
  getAllDoctor() {
    this.http.getAllDoctors().subscribe((res) => {
      this.doctorData = res as any;
    });
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's' && !this.isCtrlSPressed) {
      event.preventDefault(); // Prevent the browser's default behavior
      this.isCtrlSPressed = true; // Set the flag to true
      this.updateChanges(); // Call your save method
    }
  }

  // Listen for the keyup event to reset the flag when keys are released
  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control' || event.key === 's') {
      this.isCtrlSPressed = false; // Reset the flag when either key is released
    }
  }
  editPatientById(id: any) {
    this.http.getPatientById(id).subscribe((res: any) => {
      this.patientForm = this.fb.group({
        patientName: [res['patientName'], [Validators.required]],
        patientPhoneNumber: [res['patientPhoneNumber'], [Validators.required]],
        patientAddress: [res['patientAddress'], [Validators.required]],
        title: [res['title'], [Validators.required]],
        gender: [res['gender'], [Validators.required]],
        fatherName: [res['fatherName'], [Validators.required]],
        visitDate: [
          this.convertToISODate(res['visitDate']),
          Validators.required,
        ],
        pid: [res['pid'], Validators.required],
        consultantName: [res['consultantName'], Validators.required],

        age: [res['age'], Validators.required],
        type: [res['type'], Validators.required],
        symptoms: [res['symptoms'], Validators.required],
        medicinesPrescribed: [res['medicinesPrescribed']],
        remarks: [res['remarks']],
        paymentType: [res['paymentType']],
        paymentStatus: [res['paymentStatus']],
        nextVisit: [res['nextVisit']],
        bp: [res['bp']],
        sp02: [res['sp02']],
        pulse: [res['pulse']],
        sugar: [res['sugar']],
        appointmentId: [res['appointmentId']],
      });
      sessionStorage.setItem('editById', id);
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
    let id = sessionStorage.getItem('editById');
    setTimeout(
      () =>
        this.http
          .updatePatientById(id, {
            patientName: this.patientForm.value.patientName,
            patientPhoneNumber: this.patientForm.value.patientPhoneNumber,
            title: this.patientForm.value.title,
            gender: this.patientForm.value.gender,
            patientAddress: this.patientForm.value.patientAddress,
            age: this.patientForm.value.age,
            fatherName: this.patientForm.value.fatherName,
            admissionDate: this.patientForm.value.admissionDate,
            pid: this.patientForm.value.pid,
            consultantName: this.patientForm.value.consultantName,
            type: this.patientForm.value.type,
            symptoms: this.patientForm.value.symptoms,
            bp: this.patientForm.value.bp,
            sp02: this.patientForm.value.sp02,
            pulse: this.patientForm.value.pulse,
            sugar: this.patientForm.value.sugar,
            updatedBy: sessionStorage.getItem('user'),
            updatedOn: this.currentDate,
          })
          .subscribe(
            (res) => {
              console.log(res);
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
  deletePatientById(id: any) {
    sessionStorage.setItem('deleteById', id);
  }

  //delete
  deletePatient() {
    this.showDeleteProgressBar = true;
    setTimeout(() => {
      this.showDeleteAlert = true;
      this.http
        .deletePatientById(sessionStorage.getItem('deleteById'))
        .subscribe(
          (res) => {
            this.closeModal.nativeElement.click();
            this.showDeleteProgressBar = false;
            this.loadData();
            sessionStorage.removeItem('deleteById');
          },
          (err) => {
            console.log(err.message);
          }
        );
    }, 1000);
  }

  clearDeleteIdInSession() {
    sessionStorage.removeItem('deleteById');
  }

  clearEditbyPatientIdInSession() {
    sessionStorage.removeItem('editById');
  }
}
