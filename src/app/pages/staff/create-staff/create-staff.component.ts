import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-create-staff',
  templateUrl: './create-staff.component.html',
  styleUrl: './create-staff.component.css',
})
export class CreateStaffComponent {
  staffForm: FormGroup;
  showProgressBar: any;
  showAlert: any;

  currentDate: string;
  uniquePid = Math.floor(100000 + Math.random() * 900000);

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private datePipe: DatePipe
  ) {
    this.currentDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';

    this.staffForm = this.fb.group({
      title: ['Mr/Mrs...', [Validators.required]],
      staffName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      type: [null, [Validators.required]],
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
      async () =>
        this.http
          .createStaff({
            title: this.staffForm.value.title,
            staffName: this.staffForm.value.staffName,
            phone: this.staffForm.value.phone,
            type: this.staffForm.value.type,
            address: this.staffForm.value.address,
            pid: this.staffForm.value.pid,
            createdBy: sessionStorage.getItem('user'),
            updatedBy: null,
            createdOn: this.currentDate,
            updatedOn: null,
          })
          .subscribe(
            (res) => {
              this.showProgressBar = true;
              this.showAlert = true;
              setTimeout(() => (this.showAlert = false), 3000);
              this.showProgressBar = false;
              this.staffForm.reset();
            },
            (err) => {
              console.log(err);
            }
          ),
      3000
    );
  }
}
