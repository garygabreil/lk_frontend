import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-doctor',
  templateUrl: './manage-doctor.component.html',
  styleUrl: './manage-doctor.component.css',
})
export class ManageDoctorComponent {
  doctorForm: FormGroup;

  //progressbar
  showProgressBar: any;

  //patientData
  doctorData: any[] = [];

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

    this.doctorForm = this.fb.group({
      title: ['Mr/Mrs...', [Validators.required]],
      consultantName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      speciality: ['Choose Specialty ...', [Validators.required]],
      address: ['', [Validators.required]],
      pid: ['', [Validators.required]],
      createdOn: [''],
      updatedOn: [''],
      createdBy: [''],
      updatedBy: [''],
    });

    this.loadData();
  }

  loadData() {
    this.http.getAllDoctors().subscribe((res) => {
      this.doctorData = res as any;
      this.totalNumberOfEntries = this.doctorData.length;
    });
  }

  async editDoctorById(id: any) {
    await this.http.getDoctorById(id).subscribe((res: any) => {
      this.doctorForm = this.fb.group({
        title: [res['title'], [Validators.required]],
        consultantName: [res['consultantName'], [Validators.required]],
        phone: [
          res['phone'],
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ],
        speciality: [res['speciality'], Validators.required],
        address: [res['address'], [Validators.required]],
        pid: [res['pid'], [Validators.required]],
        createdOn: [res['createdOn']],
        updatedOn: [res['updatedOn']],
        createdBy: [res['createdBy']],
        updatedBy: [res['updatedBy']],
      });
      sessionStorage.setItem('editDoctorById', id);
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

  // calculate age
  calculateAge(dob: string): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  updateChanges() {
    this.showProgressBar = true;
    setTimeout(
      () =>
        this.http
          .updateDoctorById(sessionStorage.getItem('editDoctorById'), {
            title: this.doctorForm.value.title,
            consultantName: this.doctorForm.value.consultantName,
            phone: this.doctorForm.value.phone,
            speciality: this.doctorForm.value.speciality,
            address: this.doctorForm.value.address,
            pid: this.doctorForm.value.pid,
            createdOn: this.doctorForm.value.currentDate,
            updatedOn: this.currentDate,
            createdBy: this.doctorForm.value.createdBy,
            updatedBy: sessionStorage.getItem('user'),
          })
          .subscribe(
            (res) => {
              this.showProgressBar = true;
              this.showAlert = true;
              setTimeout(() => (this.showAlert = false), 3000);
              this.showProgressBar = false;
              sessionStorage.removeItem('editDoctorById');
              this.loadData();
            },
            (err) => {
              console.log(err);
            }
          ),
      3000
    );
  }

  //delete patient by id
  deleteDoctorById(id: any) {
    sessionStorage.setItem('deleteDoctorById', id);
  }

  //delete
  deleteDoctor() {
    this.showDeleteProgressBar = true;
    setTimeout(() => {
      this.showDeleteAlert = true;
      this.http
        .deleteDoctorById(sessionStorage.getItem('deleteDoctorById'))
        .subscribe(
          (res) => {
            this.closeModal.nativeElement.click();
            this.showDeleteProgressBar = false;
            this.loadData();
            sessionStorage.removeItem('deleteDoctorById');
          },
          (err) => {
            console.log(err.message);
          }
        );
    }, 3000);
  }

  deleteSessionByID() {
    sessionStorage.removeItem('deleteDoctorById');
  }

  editSessionByID() {
    sessionStorage.removeItem('editDoctorById');
  }
}
