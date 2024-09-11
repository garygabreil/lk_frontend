import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-manage-staff',
  templateUrl: './manage-staff.component.html',
  styleUrl: './manage-staff.component.css',
})
export class ManageStaffComponent {
  staffForm: FormGroup;

  //progressbar
  showProgressBar: any;

  //patientData
  staffData: any[] = [];

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

    this.staffForm = this.fb.group({
      title: ['Mr/Mrs...', [Validators.required]],
      staffName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      type: ['Choose Specialty ...', [Validators.required]],
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
    this.http.getAllStaffs().subscribe((res) => {
      this.staffData = res as any;
      this.totalNumberOfEntries = this.staffData.length;
    });
  }

  async editStaffById(id: any) {
    await this.http.getStaffById(id).subscribe((res: any) => {
      this.staffForm = this.fb.group({
        title: [res['title'], [Validators.required]],
        staffName: [res['staffName'], [Validators.required]],
        phone: [
          res['phone'],
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ],
        type: [res['type'], Validators.required],
        address: [res['address'], [Validators.required]],
        pid: [res['pid'], [Validators.required]],
        createdOn: [res['createdOn']],
        updatedOn: [res['updatedOn']],
        createdBy: [res['createdBy']],
        updatedBy: [res['updatedBy']],
      });
      sessionStorage.setItem('editStaffById', id);
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
          .updateStaffById(sessionStorage.getItem('editStaffById'), {
            title: this.staffForm.value.title,
            staffName: this.staffForm.value.staffName,
            phone: this.staffForm.value.phone,
            type: this.staffForm.value.type,
            address: this.staffForm.value.address,
            pid: this.staffForm.value.pid,
            createdOn: this.staffForm.value.currentDate,
            updatedOn: this.currentDate,
            createdBy: this.staffForm.value.createdBy,
            updatedBy: sessionStorage.getItem('user'),
          })
          .subscribe(
            (res) => {
              this.showProgressBar = true;
              this.showAlert = true;
              setTimeout(() => (this.showAlert = false), 3000);
              this.showProgressBar = false;
              sessionStorage.removeItem('editStaffById');
              this.loadData();
            },
            (err) => {
              console.log(err);
            }
          ),
      3000
    );
  }

  //delete staff by id
  deleteStaffById(id: any) {
    sessionStorage.setItem('deleteStaffById', id);
  }

  //delete
  deleteStaff() {
    this.showDeleteProgressBar = true;
    setTimeout(() => {
      this.showDeleteAlert = true;
      this.http
        .deleteStaffById(sessionStorage.getItem('deleteStaffById'))
        .subscribe(
          (res) => {
            this.closeModal.nativeElement.click();
            this.showDeleteProgressBar = false;
            this.loadData();
            sessionStorage.removeItem('deleteStaffById');
          },
          (err) => {
            console.log(err.message);
          }
        );
    }, 3000);
  }

  deleteSessionByID() {
    sessionStorage.removeItem('deleteStaffById');
  }

  editSessionByID() {
    sessionStorage.removeItem('editStaffById');
  }
}
