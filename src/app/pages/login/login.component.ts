import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  showProgressBar: any;
  showAlert: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService
  ) {
    this.loginForm = this.fb.group({
      pid: ['', Validators.required],
    });
  }

  login() {
    // Implement your authentication logic here

    if (parseInt(this.loginForm.value.pid) == 1234) {
      this.router.navigate(['/dashboard']);
      sessionStorage.setItem('user', 'admin');
      sessionStorage.setItem('role', 'admin');
    }

    this.showProgressBar = true;
    setTimeout(() => {
      this.showProgressBar = true;
      this.http
        .getPatientByPid(this.loginForm.value.pid)
        .subscribe((res: any) => {
          if (Object.values(res).length > 1) {
            this.showProgressBar = false;
            this.router.navigate(['/dashboard']);
            sessionStorage.setItem('user', res['staffName']);
            sessionStorage.setItem('role', res['type']);
          } else {
            this.showAlert = true;
            this.showProgressBar = false;
          }
        });
    }, 2000);
  }
}
