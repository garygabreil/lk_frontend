import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { DatePipe } from '@angular/common';

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
            updatedBy: null,
            createdOn: this.currentDate,
            updatedOn: null,
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
