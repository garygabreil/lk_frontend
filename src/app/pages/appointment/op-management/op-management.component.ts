import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-op-management',
  templateUrl: './op-management.component.html',
  styleUrl: './op-management.component.css',
})
export class OpManagementComponent {
  appointmentDetails: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {
    this.getAllPatientAppointment();
  }

  getAllPatientAppointment() {
    this.http.getAllPatient().subscribe((res) => {
      this.appointmentDetails = res as any;
    });
  }
  viewPatientHistory() {}
}
